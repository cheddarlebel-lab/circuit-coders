# Citation Submission Packet — Toyota & Kia of Vero Beach
*Built 2026-06-22. READY to submit, but GATED — see the red box.*

> 🔴 **DO NOT SUBMIT until the canonical PHONE per store is confirmed with Jared.**
> Our prep docs contradict each other (canonical-nap.md says Kia 772-291-0031; citation-audit.md shows 0031 is Toyota's *service* line and Kia's real line is 772-291-0624 per Apple Maps + Kia's own site). Propagating a wrong number = making the fragmentation worse. Confirm on the access call, fill `PHONE` below, THEN submit.

---

## The canonical record to paste everywhere (one source of truth)

| Field | Toyota of Vero Beach | Kia of Vero Beach |
|---|---|---|
| **Name** (exact) | Toyota of Vero Beach | Kia of Vero Beach |
| **Address** | 1075 S US Hwy 1, Vero Beach, FL 32962 | 1105 S US Hwy 1, Vero Beach, FL 32962 |
| **Phone** | ⛔ CONFIRM — `772-569-8000` (locator) vs the real BDC line | ⛔ CONFIRM — `772-291-0624` (Apple/own-site) vs `772-291-0031` (= Toyota svc?) |
| **Website** | https://www.verobeachtoyota.com | https://www.kiaofverobeach.com |
| **Primary category** | Toyota Dealer | Kia Dealer |
| **Hours** | ⛔ CONFIRM from GBP (treat GBP as master) | ⛔ CONFIRM from GBP |
| **Map location** | 27.6178, -80.4078 (approx) | 27.6172, -80.4079 (approx) |

> Use the address abbreviation **"S US Hwy 1"** exactly, every listing. Never "Toyota Kia of Vero Beach" (aggregator mash-up). Never the call-tracking numbers (Toyota: 206-4571/291-0653/617-xxxx/732-1172/252-5818; Kia: 732-0420/888-xxxx/360-4033/912-381-8422 — all tracking/wrong).

---

## Free-direct submission targets (no dealership login required to push the record)

| # | Directory | What it feeds | Method | Account needed | Notes |
|---|---|---|---|---|---|
| 1 | **Data Axle (Express Update)** | Acxiom/data ecosystem → many downstream | expressupdate.com free listing claim/add | Free account (our email) | Foundational data aggregator; corrections propagate widely. |
| 2 | **Localeze / Neustar** | Localeze ecosystem → Apple, Yelp, others | neustarlocaleze.biz free add | Free account | Pairs with Data Axle as the 2 core US aggregators. |
| 3 | **Bing Places** | Bing Maps / Cortana | bingplaces.com — add business | Microsoft account | Phone/postcard verify; can bulk-import from GBP once GBP claimed. |
| 4 | **Apple Business Connect** | Apple Maps / Siri | businessconnect.apple.com | Apple ID | Fast + high-value; Kia already clean on Apple (772-291-0624) — confirm/claim. |
| 5 | **Yellow Pages** | YP network | yellowpages.com claim | Free | Toyota has 2 dup listing IDs (4849332 + 457993395) — claim + merge. |
| 6 | **MapQuest** | MapQuest / data resellers | mapquest.com add/claim | Free | Backed by Foursquare/HERE data. |
| 7 | **Manta** | SMB directory | manta.com add | Free | Low effort, decent authority. |
| 8 | **Hotfrog / Cylex / Chamberofcommerce.com** | long-tail citations | free add each | Free | Batch these last; consistency > volume. |

> **NOT in this packet (paid / decided):** Foursquare paid claim — SKIPPED per Leo 2026-06-21. CARFAX dealer program — SKIPPED. Birdeye — needs owner claim (separate, on the access checklist).

## Submission order (once phones confirmed)
1. **Data Axle + Localeze first** (they feed everything downstream — fix the source before the leaves).
2. Apple Business Connect (fast, high-value, Kia already near-clean).
3. Bing Places (verify by phone/postcard).
4. YellowPages (claim + merge the 2 Toyota dupes).
5. MapQuest, Manta, then the long-tail batch.
6. Re-sweep at day 30; citation consistency is a reportable retainer KPI (feeds the monthly report + queue tracker).

## Log each submission to the queue
After each one, run:
`python3 ../machine/queue_tracker.py add --store <toyota|kia> --platform aggregator --item "<directory> citation" --eta 14`
so it shows in the "nothing silently disappears" tracker and the monthly report.
