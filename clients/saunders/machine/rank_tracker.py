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
import sys

import lib

HISTORY = lib.DATA / "rank_history.json"

KEYWORDS = [
    # Toyota
    ("toyota", "toyota dealer vero beach"),
    ("toyota", "toyota dealership near me"),
    ("toyota", "toyota dealer sebastian fl"),
    ("toyota", "new toyota vero beach"),
    ("toyota", "toyota service vero beach"),
    ("toyota", "oil change vero beach"),
    ("toyota", "toyota dealer indian river county"),
    ("toyota", "used car dealer vero beach"),
    # Kia
    ("kia", "kia dealer vero beach"),
    ("kia", "kia dealership near me"),
    ("kia", "kia dealer sebastian fl"),
    ("kia", "telluride vero beach"),
    ("kia", "kia service vero beach"),
    ("kia", "kia indian river county"),
    ("kia", "new kia vero beach"),
]


def check_keyword(store_key, keyword):
    """SEAM — wire to Chrome at runtime. Return {map_pack:int|None, organic:int|None}.
    None = not found in top results. Returns Nones until wired so history runs dry."""
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
