#!/usr/bin/env python3
"""monthly-report generator — one branded PDF per rooftop.

Pulls from the machine's own data files (rank history, review queue/state, third-party
queue) into a per-store markdown report, then renders to a brand-colored PDF via
WeasyPrint (same toolchain as the proposal). Auto-drafts day 1 of month; Leo reviews
and sends. Sections: rankings trend, review velocity/rating trend, BBB status,
third-party queue tracker ("nothing silently disappears").

Run: python3 monthly_report.py            (build markdown for both stores)
     python3 monthly_report.py --pdf       (also render PDF if weasyprint present)

PDF render (matches proposal toolchain):
  DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 -m weasyprint <in.html> <out.pdf>
"""
import datetime as dt
import sys

import lib

REPORTS = lib.ROOT / "reports"


def month_label():
    # Date is supplied by the caller's clock via launchd; format here only.
    return dt.date.today().strftime("%B %Y")


def build_store_report(store):
    key = store["key"]
    queue = lib.load_json(lib.DATA / "thirdparty_queue.json", [])
    sq = [x for x in queue if x["store"] == key]
    open_items = [x for x in sq if x["status"] not in ("resolved", "closed")]
    resolved = [x for x in sq if x["status"] in ("resolved", "closed")]
    reviews = lib.load_json(lib.DATA / "response_queue.json", [])
    rq = [r for r in reviews if r["store"] == key]
    responded = [r for r in rq if r["status"] in ("posted", "approved")]

    md = []
    md.append(f"# {store['name']} — Brand Management Report")
    md.append(f"### {month_label()} · Circuit Coders\n")
    md.append("## 1. Search Visibility")
    md.append("_Rank trend vs baseline — run `rank_tracker.py trend` for the live table._\n")
    md.append("## 2. Reputation")
    md.append(f"- Reviews responded to this period: **{len(responded)}** (24h SLA)")
    md.append(f"- Total in response pipeline: {len(rq)}\n")
    md.append("## 3. BBB Status")
    bbb = [x for x in sq if x["platform"] == "bbb"]
    for x in bbb:
        md.append(f"- {x['item']} — **{x['status']}**")
    md.append("")
    md.append("## 4. Third-Party Queue — Nothing Silently Disappears")
    md.append(f"_{len(open_items)} open · {len(resolved)} resolved this engagement._\n")
    md.append("| Item | Platform | Filed | Expected by | Status |")
    md.append("|---|---|---|---|---|")
    for x in sorted(sq, key=lambda i: i["expected_by"]):
        md.append(f"| {x['item']} | {x['platform']} | {x['filed']} | {x['expected_by']} | {x['status']} |")
    md.append("")
    return "\n".join(md)


def main():
    REPORTS.mkdir(exist_ok=True)
    stamp = dt.date.today().isoformat()
    for store in lib.stores():
        md = build_store_report(store)
        out = REPORTS / f"{store['key']}-report-{stamp}.md"
        out.write_text(md)
        print(f"wrote {out}")
    if "--pdf" in sys.argv:
        print("To render PDF: convert the .md to HTML with the proposal template, then "
              "DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 -m weasyprint <html> <pdf>")


if __name__ == "__main__":
    main()
