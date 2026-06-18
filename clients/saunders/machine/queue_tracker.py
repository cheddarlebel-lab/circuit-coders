#!/usr/bin/env python3
"""third-party queue tracker — the "nothing silently disappears" promise.

Every item we file with a platform we DON'T control (FB merge, Yelp dupe removal,
BBB licensing correction, DealerOn ticket, aggregator submissions, OEM locator edits)
gets logged here with a filed-date, an expected-resolution window, and a status. A
weekly check flags anything past its expected window so it surfaces in the monthly
report instead of rotting silently.

Usage:
  python3 queue_tracker.py add --store toyota --platform yelp --item "Dupe service listing removal" --eta 14
  python3 queue_tracker.py update <id> --status resolved
  python3 queue_tracker.py check          # flag overdue, notify
  python3 queue_tracker.py report         # markdown table for the monthly report
"""
import argparse
import datetime as dt
import hashlib

import lib

QUEUE = lib.DATA / "thirdparty_queue.json"

# Expected resolution windows (days) — from the proposal's researched timeline
DEFAULT_ETA = {
    "facebook": 21, "yelp": 14, "bbb": 30, "dealeron": 21,
    "aggregator": 90, "oem_locator": 30, "apple": 7, "google": 3,
}


def _id(store, platform, item):
    return hashlib.sha1(f"{store}|{platform}|{item}".encode()).hexdigest()[:10]


def _load():
    return lib.load_json(QUEUE, [])


def add(args):
    q = _load()
    today = dt.date.today()
    eta_days = args.eta or DEFAULT_ETA.get(args.platform, 30)
    item = {
        "id": _id(args.store, args.platform, args.item),
        "store": args.store,
        "platform": args.platform,
        "item": args.item,
        "filed": today.isoformat(),
        "eta_days": eta_days,
        "expected_by": (today + dt.timedelta(days=eta_days)).isoformat(),
        "status": "filed",
        "notes": args.notes or "",
    }
    q = [x for x in q if x["id"] != item["id"]] + [item]
    lib.save_json(QUEUE, q)
    print(f"added {item['id']}: {args.store}/{args.platform} — {args.item} (expect by {item['expected_by']})")


def update(args):
    q = _load()
    for x in q:
        if x["id"] == args.id:
            if args.status:
                x["status"] = args.status
            if args.notes:
                x["notes"] = args.notes
            x["last_update"] = dt.date.today().isoformat()
            lib.save_json(QUEUE, q)
            print(f"updated {args.id} -> {x['status']}")
            return
    print(f"id {args.id} not found")


def check(args):
    q = _load()
    today = dt.date.today()
    def _overdue(x):
        if x["status"] in ("resolved", "closed"):
            return False
        try:
            return dt.date.fromisoformat(x["expected_by"]) < today
        except ValueError:
            return False  # not yet dated (PENDING_KICKOFF / TBD) — clock starts at access
    overdue = [x for x in q if _overdue(x)]
    open_items = [x for x in q if x["status"] not in ("resolved", "closed")]
    if overdue:
        lib.notify("Saunders — overdue 3rd-party items",
                   f"{len(overdue)} filed item(s) past expected window. Follow up.")
    print(f"queue: {len(open_items)} open, {len(overdue)} OVERDUE, {len(q)} total")
    for x in overdue:
        print(f"  OVERDUE {x['id']} {x['store']}/{x['platform']}: {x['item']} (expected {x['expected_by']})")


def report(args):
    q = sorted(_load(), key=lambda x: (x["store"], x["expected_by"]))
    print("| Store | Platform | Item | Filed | Expected by | Status |")
    print("|---|---|---|---|---|---|")
    for x in q:
        print(f"| {x['store']} | {x['platform']} | {x['item']} | {x['filed']} | {x['expected_by']} | {x['status']} |")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add"); a.add_argument("--store", required=True); a.add_argument("--platform", required=True)
    a.add_argument("--item", required=True); a.add_argument("--eta", type=int); a.add_argument("--notes")
    a.set_defaults(func=add)
    u = sub.add_parser("update"); u.add_argument("id"); u.add_argument("--status"); u.add_argument("--notes")
    u.set_defaults(func=update)
    c = sub.add_parser("check"); c.set_defaults(func=check)
    r = sub.add_parser("report"); r.set_defaults(func=report)
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
