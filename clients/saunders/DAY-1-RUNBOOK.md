# Day-1 Execution Runbook — Saunders Get-Well Sprint
*Built 2026-06-22 (kickoff). Every Phase-0 proposal promise → its prepped artifact → what unblocks it → the execution step. Prep is DONE; this is the "flip switches" list. Work starts at the access call (Leo's call — not gated on payment).*

## Legend for "Unblock"
🟢 = nothing needed, do it now · 🔑 = needs a specific login/access · 📞 = needs canonical phone confirmed · 🧑 = needs the named staff contact's facts · 💲 = costs money (Leo must approve) · 🏢 = third-party clock (file + track, not in our control)

---

## A. Toyota homepage H1 + heading/meta (both sites)
- **Artifact:** `dealeron/h1-meta-correction-sheet.md` (40-field, paste-ready; Kia H1 also broken)
- **Unblock:** 🔑 DealerOn dashboard (or rep intro — push for direct Cosmos CMS access; tickets run weeks/page)
- **Do:** file the H1 fix first (free instant win to demo value), then the full heading/meta corrections.

## B. BBB rating recovery (the highest-leverage move)
- **Artifacts:** `bbb/bbb-licensing-correction-letter.md` (MV4029 → removes the -41pt alert), `bbb/bbb-kia-identity-separation-request.md` (split Kia from the F entity + ZIP 32960→32962), `bbb/response-drafts.md` (36 complaint replies)
- **Unblock:** 🔑 BBB account + 🧑 staff facts per complaint + 💲no / 🏢 BBB controls its own clock + client supplies the **MV4029 certificate image**
- **Do:** file licensing-correction letter w/ MV4029 proof → file Kia identity-separation → fill the 36 drafts with staff in one ~45-min session → submit in batches. Expect F→B/C in days–weeks once the licensing alert clears.

## C. Canonical phone scheme + DealerRater Kia address
- **Artifacts:** `nap/canonical-nap.md`, `nap/citation-audit.md`
- **Unblock:** 📞 **CONFIRM PHONE FIRST** (Toyota 569-8000? · Kia 0624 vs 0031 — see agenda decision #1). DealerRater Kia address fix (1075→1105) is 🔑 self-serve once claimed.
- **Do:** lock canonical phone per store → then everything NAP downstream follows.

## D. Citations (50+ directories)
- **Artifact:** `nap/citation-submission-packet.md` (8 free-direct dirs, order, queue-logging)
- **Unblock:** 📞 phone confirmed (do NOT propagate a wrong number) · 🟢 then submit free-direct (Data Axle + Localeze first). 💲 Foursquare/CARFAX SKIPPED per Leo.
- **Do:** after phone lock → Data Axle, Localeze, Apple Business Connect, Bing, YellowPages (merge 2 Toyota dups), MapQuest, Manta, long-tail. Log each via `queue_tracker.py add`.

## E. Claim unclaimed + dedupe (Birdeye / Facebook / Yelp)
- **Artifacts:** `platform-actions/facebook-merge-packet.md`, `platform-actions/yelp-dedupe-packet.md` (in build), Birdeye in `nap/`
- **Unblock:** 🔑 owner claims (Birdeye ×2), 🔑 FB admin (merge — rename keeper first, DELETES loser reviews → 🧑 Jared's OK on the loss), 🏢 Yelp dup-removal request
- **Do:** claim both Birdeye (fix "Missouri" addr) → FB rename+merge per packet → file Yelp dup removals w/ evidence pack.

## F. Domains
- **Artifact:** `nap/domain-audit.md`
- **Unblock:** 🔑 registrar access + 🧑 ownership confirmation
- **Do:** 🔴 **URGENT — renew toyotaofvero.com** (live staff email domain, expires 10/20/2026). Verify verobeachkia.com ownership (privacy-redacted) → recover/redirect. Repoint expired sibling toyotaverobeach.com.

## G. Baseline report (the "before")
- **Artifact:** `baseline/baseline-2026-06-21.md` ✅ DONE 🟢 — reviews already climbing (Toyota +264, Kia +215 since 6/12). Just format + deliver.

## H. Review response system (24h SLA)
- **Artifacts:** `machine/` engine, `machine/REVIEW-BRIDGE.md` (working Google extraction)
- **Unblock:** 🔑 GBP/Yelp/etc. to POST replies; 🟢 monitoring runs now as a scheduled Claude session (NOT headless daemon — don't oversell). Yelp/FB walled = manual.
- **Do:** run review-monitor on schedule → draft replies → Leo approves / 24h auto-post template-safe 4-5★ (once Jared OKs that rule on the call).

## I. Review generation
- **Artifacts:** `review-gen/print/review-cards.pdf` ✅ (Toyota+Kia Google links live & verified), `review-gen/staff-one-pager.md`
- **Unblock:** 🟢 print + give to Jared for the counters (Kia CARFAX/Yelp cards stay placeholder — owner-side).
- **Do:** hand off cards + train staff on the 10-sec ask.

## J. GBP takeover (both stores)
- **Artifact:** `gbp/gbp-optimization-packet.md` (in build — categories/services/description/4 Posts each)
- **Unblock:** 🔑 GBP manager invite ×2 (to cheddar.lebel@gmail.com)
- **Do:** fix Toyota category (Car Dealer → **Toyota Dealer**) → paste description/services/attributes → publish first 4 Posts → request photos.

## K. Local defense pages + content
- **Artifacts:** `pages/` (4 P0, softened, service page now publish-safe), `content/` (4 posts), `previews/`
- **Unblock:** 🔑 DealerOn (publish) + fill `{{placeholders}}` (SRP/scheduler/finance URLs, hours, prices) + 🧑 confirm 2 residual claims (Kia "honor warranty here", RAV4 "in writing")
- **Do:** once DealerOn access → fill placeholders → confirm claims → publish 1-2 pages/wk + weekly content.

---

## The hard gates (nothing past these until resolved)
1. 📞 **Phone confirmation** — blocks all NAP/citation propagation. Agenda decision #1.
2. 🔑 **DealerOn access** — blocks H1 fix + page publishing (the visible wins).
3. 🧑 **Named staff contact** — blocks BBB complaint facts.
4. Client supplies **MV4029 certificate** — blocks the BBB licensing correction.

## What's already 100% done, no access needed
Baseline ✅ · NAP+citation packet ✅ · QR review cards ✅ · BBB letters + 36 replies ✅ · H1/meta sheet ✅ · pages+content drafted & publish-safe ✅ · review engine + working Google extraction ✅ · domain audit ✅ · (GBP packet + FB/Yelp packets finishing).

**Weekly progress report to Jared is a HARD RULE — draft it, run by Leo, never auto-send.**
