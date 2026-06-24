#!/usr/bin/env python3
"""rank-tracker — weekly local/organic rank snapshot for the monthly report.

Same 15-keyword set as the Stage-A baseline. Chrome-driven checks at runtime
(claude-in-chrome): for each keyword, capture map-pack position + organic position.
This script owns the keyword set, the history file, and the trend math; the actual
SERP read is the seam `check_keyword()`.

Run: python3 rank_tracker.py            (append this week's snapshot)
     python3 rank_tracker.py trend      (print movement vs first + last snapshot)
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import urllib.parse

import lib

HISTORY = lib.DATA / "rank_history.json"

KEYWORDS = [
    # Toyota
    ("toyota", "toyota dealer vero beach"),
    ("toyota", "toyota dealer indian river county fl"),
    ("toyota", "toyota dealer sebastian fl"),
    ("toyota", "new toyota vero beach"),
    ("toyota", "toyota service vero beach"),
    ("toyota", "oil change vero beach"),
    ("toyota", "toyota dealer indian river county"),
    ("toyota", "used car dealer vero beach"),
    # Kia
    ("kia", "kia dealer vero beach"),
    ("kia", "kia dealer indian river county fl"),
    ("kia", "kia dealer sebastian fl"),
    ("kia", "telluride vero beach"),
    ("kia", "kia service vero beach"),
    ("kia", "kia indian river county"),
    ("kia", "new kia vero beach"),
]


# Brand name fragments we count as "the dealership appearing" in a result line.
_STORE_MATCH = {
    "toyota": re.compile(r"toyota of vero beach|vero beach toyota", re.I),
    "kia": re.compile(r"kia of vero beach|vero beach kia", re.I),
}

# BATTLE-TEST FINDINGS (2026-06-21, claude-in-chrome on live Google):
#  * google.com/search loads with NO CAPTCHA and NO consent wall; the result
#    location resolved correctly to "Vero Beach, FL" (critical — local rank is
#    location-dependent, so a wrong geo would silently corrupt the data).
#  * ORGANIC results render server-side (h3 headings present in DOM order) — so
#    organic position is parseable from page text reliably.
#  * The MAP PACK (local 3-pack) is JS-lazy-loaded and did NOT render as discrete
#    DOM nodes in the automated session: no ordered local-pack businesses, only
#    the dealership's own knowledge-panel rating ("Rated 4.5 out of 5"). So
#    map-pack POSITION (1-3) requires a live interactive Chrome session via the
#    bridge below; without it we record None rather than guess.
#  RISK for go-live: map_pack will be None on headless/launchd runs unless the
#    Chrome bridge is wired. Organic + "appears in pack at all" are trustworthy.


def _parse_organic(serp_text, store_key):
    """Find the 1-based organic position of the dealership in SERP heading text.
    Returns int or None. Pure + defensive."""
    pat = _STORE_MATCH.get(store_key)
    if not pat or not serp_text:
        return None
    # Heading lines come newline-separated from get_page_text / innerText.
    lines = [ln.strip() for ln in serp_text.splitlines() if ln.strip()]
    pos = 0
    for ln in lines:
        # crude organic-result detector: a result title line (not nav chrome)
        if len(ln) < 8 or ln.lower() in ("all", "images", "videos", "news", "maps", "tools"):
            continue
        pos += 1
        if pat.search(ln):
            return pos
    return None


def _chrome_bridge(store_key, keyword):
    """Runtime SERP fetch. The launchd wrapper sets SAUNDERS_RANK_BRIDGE to a
    command that, given (store_key, keyword, search_url), prints JSON:
        {"map_pack": int|null, "organic_text": "<serp heading text>"}
    Returns that dict or None (dry run / no bridge)."""
    cmd = os.environ.get("SAUNDERS_RANK_BRIDGE")
    if not cmd:
        return None
    url = "https://www.google.com/search?q=" + urllib.parse.quote_plus(keyword)
    try:
        proc = subprocess.run([cmd, store_key, keyword, url],
                              capture_output=True, text=True, timeout=120, check=False)
        if proc.returncode != 0 or not proc.stdout.strip():
            return None
        return json.loads(proc.stdout)
    except (subprocess.SubprocessError, json.JSONDecodeError, OSError):
        return None


def check_keyword(store_key, keyword):
    """Return {map_pack:int|None, organic:int|None} for a Google search.
    Defensive: any failure yields Nones so the history snapshot never crashes.
    map_pack comes from the live Chrome bridge (lazy-loaded local pack);
    organic is parsed from the SERP heading text."""
    bridge = _chrome_bridge(store_key, keyword)
    if not bridge:
        return {"map_pack": None, "organic": None}
    try:
        mp = bridge.get("map_pack")
        if mp is not None:
            mp = int(mp)
            mp = mp if 1 <= mp <= 3 else None
        organic = _parse_organic(bridge.get("organic_text", ""), store_key)
        return {"map_pack": mp, "organic": organic}
    except (ValueError, TypeError):
        return {"map_pack": None, "organic": None}


def snapshot():
    today = dt.date.today().isoformat()
    hist = lib.load_json(HISTORY, [])
    rows = [{"store": s, "keyword": k, **check_keyword(s, k)} for s, k in KEYWORDS]
    hist.append({"date": today, "results": rows})
    lib.save_json(HISTORY, hist)
    print(f"[{today}] rank snapshot: {len(rows)} keywords recorded")


def trend():
    hist = lib.load_json(HISTORY, [])
    if len(hist) < 2:
        print("need >=2 snapshots for a trend")
        return
    first = {(_r["store"], _r["keyword"]): _r for _r in hist[0]["results"]}
    last = {(_r["store"], _r["keyword"]): _r for _r in hist[-1]["results"]}
    print(f"Trend {hist[0]['date']} -> {hist[-1]['date']}")
    print("| Store | Keyword | Map (then->now) | Organic (then->now) |")
    print("|---|---|---|---|")
    for key in last:
        f, l = first.get(key, {}), last[key]
        print(f"| {key[0]} | {key[1]} | {f.get('map_pack')}->{l.get('map_pack')} "
              f"| {f.get('organic')}->{l.get('organic')} |")


if __name__ == "__main__":
    (trend if len(sys.argv) > 1 and sys.argv[1] == "trend" else snapshot)()
