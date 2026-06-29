# CCC ONE Secure Share — Partner Workflow & Category Map
*Collision-vertical reference. Researched 2026-06-25. Don't act on this until shop #2 is real (see trigger).*

## TL;DR verdict
**Plausible, attainable, low-risk.** Not enterprise-locked. Only hard gate = $750/yr CIECA membership. Our two modules map cleanly to two purpose-built CCC app categories (CSI + Repair Status). High approval likelihood (these are the same categories CCC's own UpdatePlus runs on). **Do it when committing to collision as a vertical — not for one shop.**

## Full workflow (start → go-live)
1. **Join CIECA** (prerequisite). ~$750/yr, revenue-based tier (<$1M company). Pay by card to start. Only real cost.
2. **Register as developer** at cccsecureshare.com/Developers — submit company + app details.
3. **Sign the developer registration agreement** (as Circuit Coders).
4. **Select App Category** — CCC verifies the category matches the app's actual commercial functionality.
5. **CCC reviews & approves** → assigns the specific BMS message types your category grants. You receive: developer dashboard, full API docs + samples, credentials, "Solution Advisor" tool.
6. **Build + test** against the sandbox — RESTful cloud API, JSON/XML, CIECA BMS standard, 128-bit encrypted cloud-to-cloud. CCC opens testing (send messages, load simulation).
7. **Go live** — each shop enables the app via **Configure → Secure Share** in CCC ONE (one toggle, free to them).

## Cost & timeline
- **Cost:** ~$750/yr CIECA + dev time. **Secure Share itself is FREE** (per-workfile/connection fees waived by CCC in 2017).
- **Timeline:** ~1–4 weeks (one documented small vendor: register Fri → live next Fri).
- **Proof it's attainable for small/mid vendors:** asTech, RepairStack, 3M are registered Secure Share apps.

## Category → message map (16 categories total; our 2)
| Our module | CCC App Category | Category purpose (verbatim) |
|---|---|---|
| **Review engine** | **CSI** | "App collects vehicle owner information to perform customer satisfaction surveys." → owner contact + post-repair completion event → review funnel |
| **Status texts** | **Repair Status** | "App provides status of a repair to the vehicle owner or their insurance company." → repair status + owner contact |

Other 14 (not ours): Body Shop Management, OEM Certification Reporting, Paint/Material Calculators, Paint Mixer, Shop Equipment, Vehicle Diagnostics, Vehicle Diagnostics Reporting, Parts Procurement, Summary Reporting, Rental Management, Workflow/Audit, OEM Procedures, QC Checklist, Detailed Reporting.

### Key insight
We likely DON'T need Estimate/Final-Bill messages (those are shop-management/reporting categories). **CSI is purpose-built to fire a satisfaction survey after a completed repair** — it already gives the "job done → ask for the review" trigger + owner contact. Cleaner than pulling financial data.

## The one open question (small, low-risk)
Exact data FIELDS per category (does CSI hand us cell + email + completion timestamp?) live behind the developer docs at cccsecureshare.com/docs — visible only after free registration or via the Solution Advisor. Category descriptions strongly imply yes. Also confirm: can one registration carry BOTH categories (CSI + Repair Status) or do we register two apps?

## Recommendation / trigger
- **Now (1 shop):** skip it. UpdatePlus (native, free) + the shop's CCC login cover TSM for free.
- **Trigger to pull it:** the day shop #2–3 signs and you're committing to collision as a vertical. Then: $750, sign, build ~1–2 weeks, go live across all shops with one connection.
- **Before paying:** free-register or ask Solution Advisor to confirm CSI + Repair Status field-level data and single-vs-double registration.
- **Why it's worth it at scale:** one connection → any of 22,000+ CCC shops, zero per-shop logins/UpdatePlus config, unified cross-shop dashboard + ROI attribution, and a real moat ("we integrate directly with your CCC" — almost no small agency does the CIECA work).

## See also
- collision-prospects-temecula.md (target shops)
- clients/tsm/ccc-updateplus-playbook.md (the free-for-now path)
