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
from pathlib import Path

import lib

STATE = lib.DATA / "reviews_seen.json"
QUEUE = lib.DATA / "response_queue.json"

# Platforms we monitor per store (keys must match stores.json platform keys)
MONITORED = ["google", "yelp", "dealerrater", "carscom", "carfax", "facebook"]


def review_id(store_key, platform, review):
    raw = f"{store_key}|{platform}|{review.get('author','')}|{review.get('date','')}|{review.get('text','')[:80]}"
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


def fetch_reviews(store, platform):
    """SEAM — wire to Chrome scrape / platform API at kickoff.
    Must return a list of dicts: {author, date, rating(int 1-5), text, url}.
    Returns [] until access is configured, so the machine is safe to run now."""
    if not lib.access_ready(store, platform):
        return []
    # TODO(kickoff): claude-in-chrome navigate to store['platforms'][platform]['url'],
    # read_page, parse the review cards. Keep parsing here; state stays below.
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
