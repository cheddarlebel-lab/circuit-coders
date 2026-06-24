#!/usr/bin/env python3
"""review-monitor — the 24h-SLA engine.

Polls each store's review platforms, detects NEW reviews since last run, drafts a
response per the voice rules, and notifies Leo. 4-5 star template-safe reviews can
auto-post after 24h IF Leo enables that per-store rule; everything else waits for
one-tap approval.

POLLING BACKEND: the actual fetch is Chrome-driven (claude-in-chrome) at runtime —
this script owns state, dedup, drafting and the SLA clock. `fetch_reviews()` is the
seam: when access lands at kickoff, wire it to the Chrome scrape (or each platform's
API where one exists). Until then it returns [] so the machine runs dry without error.

Run: python3 review_monitor.py            (one poll cycle)
launchd: machine/launchd/com.circuitcoders.saunders.review-monitor.plist (2-4x/day)
"""
import datetime as dt
import hashlib
import json
import re
import subprocess
import urllib.parse
from pathlib import Path

import lib

STATE = lib.DATA / "reviews_seen.json"
QUEUE = lib.DATA / "response_queue.json"

# Platforms we monitor per store (keys must match stores.json platform keys)
MONITORED = ["google", "yelp", "dealerrater", "carscom", "carfax", "facebook"]


def review_id(store_key, platform, review):
    raw = f"{store_key}|{platform}|{review.get('author','')}|{review.get('date','')}|{review.get('text','')[:80]}"
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


# --- Google review scraping --------------------------------------------------
#
# BATTLE-TEST FINDINGS (2026-06-21, claude-in-chrome against live public pages):
#  * google.com/search and google.com/maps load with NO consent wall and NO
#    CAPTCHA for this dealership/location (location resolved as "Vero Beach, FL",
#    which is what we want for accurate local results).
#  * The Google *aggregate* signal is reliably present in the server-rendered
#    SERP: per-platform star ratings + review counts are exposed as
#    aria-labels like "Rated 4.5 out of 5" and
#    "Toyota of Vero Beach got a 4.4 stars review on CARFAX. 2,532 reviews".
#    Confirmed values: Google 4.5/5,982 · CARFAX 4.4/2,532 · DealerRater 4.0/434
#    · Yelp 2.2/113 · Facebook 78% (470).  <-- these match canonical facts.
#  * Individual Google review *cards* (author/date/rating/text) DID NOT render
#    in the automated Maps panel: the reviews feed is JS-lazy-loaded and never
#    populated the DOM in the headless-flagged session (0 [data-review-id],
#    0 "...ago" timestamps after scrolling the feed container). So per-review
#    scraping needs a real, interactive Chrome session at kickoff — the parser
#    below is written against the live Maps DOM so it WILL work there, and
#    degrades to [] (never crashes) when cards aren't present.
#  * Yelp is bot/login-walled and shows a hostile 2.2/113 rating — do not auto-
#    engage; treat as monitor-only/manual.  Not scraped here.
#
# The runtime fetch is performed by a Chrome page-script (claude-in-chrome
# javascript_tool) whose result is handed to parse_google_review_cards(). The
# launchd job invokes review_monitor with that bridge wired; standalone runs and
# any platform we lack a bridge for return [] so the machine is always safe.

PLATFORM_FEASIBILITY = {
    "google": "scrapeable (public, no wall) — aggregate always; per-review needs live Chrome",
    "yelp": "BLOCKED — bot/login wall; monitor-only",
    "dealerrater": "aggregate-only via Google SERP; per-review not wired",
    "carscom": "aggregate-only via Google SERP; per-review not wired",
    "carfax": "aggregate-only via Google SERP; per-review not wired",
    "facebook": "BLOCKED — login wall; admin_access required",
}

# Maps review-card selectors verified against the live 2026 DOM. Kept as data so
# they're easy to repair if Google reshuffles class names.
_MAPS_CARD = "div[data-review-id], div.jftiEf"
_STAR_RE = re.compile(r"(\d(?:\.\d)?)\s*star", re.I)
_AGG_RE = re.compile(
    r"Rated\s+(\d(?:\.\d)?)\s+out of 5(?:.*?\((\d[\d,]*)\))?", re.I)


def parse_google_review_cards(cards):
    """Turn raw Maps review-card dicts (from the Chrome page-script) into the
    canonical {author, date, rating, text, url} shape. Pure + defensive: any
    malformed card is skipped, never raised."""
    out = []
    for c in cards or []:
        try:
            rating = c.get("rating")
            if rating is None and c.get("rating_label"):
                m = _STAR_RE.search(c["rating_label"])
                rating = int(round(float(m.group(1)))) if m else None
            if rating is not None:
                rating = max(1, min(5, int(round(float(rating)))))
            author = (c.get("author") or "").strip()
            text = (c.get("text") or "").strip()
            if not author and not text:
                continue
            out.append({
                "author": author or "there",
                "date": (c.get("date") or "").strip(),
                "rating": rating,
                "text": text,
                "url": c.get("url") or "",
            })
        except (ValueError, TypeError, AttributeError):
            continue
    return out


# The exact page-script run in Chrome to harvest review cards. Stored here so the
# runtime bridge (or a human at kickoff) injects the SAME, tested extraction.
# NOTE: load the dedicated reviews FEED first, not the Overview tab. The Overview
# panel only exposes ~3 "review highlight" cards; the full feed lives behind the
# Reviews tab. The reliable way to land directly on it is the place permalink with
# the `!9m1!1b1` data segment, e.g.:
#   https://www.google.com/maps/place/<NAME>/@<lat>,<lng>,17z/data=!4m8!3m7!1s<FTID>!8m2!3d<lat>!4d<lng>!9m1!1b1
# where <FTID> is the "0x...:0x..." feature id (grab it from the place's own
# permalink after a /maps/search/<name>). Then run this script.
# Verified 2026-06-21 against Toyota (8+ cards) and Kia (5 cards) feeds.
GOOGLE_MAPS_REVIEW_SCRIPT = r"""
(async () => {
  // Find the REAL scrollable feed container by walking up from a review card
  // (its class includes a trailing token like 'XiKgde' that a hardcoded
  // selector misses). Falls back to role=feed.
  const probe = document.querySelector('div[data-review-id]');
  let sc = null;
  for (let el = probe; el; el = el.parentElement) {
    const s = getComputedStyle(el);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll')
        && el.scrollHeight > el.clientHeight + 50) { sc = el; break; }
  }
  if (!sc) sc = document.querySelector('div[role="feed"]');
  if (sc) { for (let i=0;i<10;i++){ sc.scrollTop=sc.scrollHeight;
            await new Promise(r=>setTimeout(r,650)); } }
  // expand truncated review bodies so we capture full text
  document.querySelectorAll('button.w8nwRe, button[aria-label="See more"]')
          .forEach(b=>{ try{ b.click(); }catch(e){} });
  await new Promise(r=>setTimeout(r,400));
  // Dedupe by data-review-id (div.jftiEf double-counts the same card).
  const seen = new Set();
  const cards = [...document.querySelectorAll('div[data-review-id]')].filter(c=>{
    const id = c.getAttribute('data-review-id');
    if (!id || seen.has(id)) return false; seen.add(id); return true;
  });
  return cards.slice(0,15).map(card=>{
    const id=card.getAttribute('data-review-id');
    const star=card.querySelector('[role="img"][aria-label*="star"]');
    const author=card.querySelector('.d4r55, [class*="title"]');
    const date=card.querySelector('.rsqaWe, .DU9Pgb');
    const body=card.querySelector('.wiI7pd, .MyEned');
    return {
      author: author?author.textContent.trim():'',
      date: date?date.textContent.trim():'',
      rating_label: star?star.getAttribute('aria-label'):'',
      text: body?body.textContent.trim():'',
      // stable per-review permalink (survives feed reordering) instead of the
      // page URL, so dedup/state keying is robust
      url: id ? 'https://www.google.com/maps/reviews/data='+id : location.href,
    };
  });
})()
"""


def _chrome_bridge(store, platform):
    """Hook for the runtime to inject scraped cards. Returns a list of raw card
    dicts or None. The launchd wrapper sets SAUNDERS_REVIEW_BRIDGE to a command
    that prints JSON cards on stdout; absent that, returns None (dry-run)."""
    import os
    cmd = os.environ.get("SAUNDERS_REVIEW_BRIDGE")
    if not cmd:
        return None
    try:
        place = store["platforms"].get(platform, {}).get("place_url", "")
        proc = subprocess.run(
            [cmd, store["key"], platform, place],
            capture_output=True, text=True, timeout=120, check=False)
        if proc.returncode != 0 or not proc.stdout.strip():
            return None
        return json.loads(proc.stdout)
    except (subprocess.SubprocessError, json.JSONDecodeError, OSError):
        return None


def fetch_reviews(store, platform):
    """Return a list of {author, date, rating(1-5), text, url} for NEW-review
    detection. Defensive: returns [] on any failure or unsupported platform so
    the monitor never crashes.

    Live status (see PLATFORM_FEASIBILITY): only Google is publicly scrapeable
    without a wall. Per-review extraction runs through a Chrome bridge that feeds
    parse_google_review_cards(); when no bridge is wired (standalone/dry run) or
    for walled platforms (yelp/facebook), we return []."""
    if platform != "google":
        return []
    cards = _chrome_bridge(store, platform)
    if not cards:
        return []
    try:
        return parse_google_review_cards(cards)
    except Exception as e:  # absolute backstop — never break the poll loop
        print(f"[fetch_reviews] parse error for {store['key']}/{platform}: {e}")
        return []


def draft_response(store, platform, review):
    """Non-defensive, on-brand draft. Negative reviews route to a human-fact step."""
    rating = review.get("rating", 0)
    author = review.get("author", "there")
    name = store["name"]
    if rating >= 4:
        return (f"Thank you, {author} — we really appreciate you taking the time. "
                f"It means a lot to everyone at {name}, and we look forward to seeing you again.")
    # 1-3 star: acknowledge, take it offline, never argue, never admit specifics blindly
    return (f"{author}, thank you for the honest feedback and we're sorry your experience "
            f"didn't meet the standard we hold ourselves to at {name}. We'd like to make this "
            f"right — please reach our customer-relations team at {store['phone']} so we can "
            f"look into the details directly. [STAFF: confirm facts before posting.]")


def template_safe(review):
    """4-5 star with no complaint keywords → eligible for 24h auto-post (if store opts in)."""
    if review.get("rating", 0) < 4:
        return False
    bad = ("but", "however", "disappoint", "wait", "rude", "price", "scam", "never again")
    return not any(b in review.get("text", "").lower() for b in bad)


def main():
    now = dt.datetime.now().isoformat(timespec="seconds")
    seen = lib.load_json(STATE, {})
    queue = lib.load_json(QUEUE, [])
    new_count = 0

    for store in lib.stores():
        for platform in MONITORED:
            for r in fetch_reviews(store, platform):
                rid = review_id(store["key"], platform, r)
                if rid in seen:
                    continue
                seen[rid] = {"first_seen": now, "store": store["key"], "platform": platform}
                queue.append({
                    "id": rid,
                    "store": store["key"],
                    "platform": platform,
                    "rating": r.get("rating"),
                    "author": r.get("author"),
                    "text": r.get("text"),
                    "url": r.get("url"),
                    "draft": draft_response(store, platform, r),
                    "auto_post_eligible": template_safe(r),
                    "queued_at": now,
                    "status": "awaiting_approval",
                    "sla_due": (dt.datetime.now() + dt.timedelta(hours=lib.load_config()["sla_hours"]))
                               .isoformat(timespec="seconds"),
                })
                new_count += 1

    lib.save_json(STATE, seen)
    lib.save_json(QUEUE, queue)

    if new_count:
        lib.notify("Saunders — new reviews",
                   f"{new_count} new review(s) drafted. Approve in response_queue.json (24h SLA).")
    print(f"[{now}] review-monitor: {new_count} new, {len(queue)} in queue")


if __name__ == "__main__":
    main()
