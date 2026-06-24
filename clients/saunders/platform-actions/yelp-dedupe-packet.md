# Yelp Duplicate-Removal Packet — Saunders (Toyota & Kia of Vero Beach)

**Phase:** 0 (cleanup) · **Prepared:** 2026-06-22 · **Data source:** public Google `site:yelp.com` index + Yelp listing metadata (logged-out)
**Canonical NAP:** Toyota **1075** S US Hwy 1 · Kia **1105** S US Hwy 1 · Vero Beach, FL 32962
**Status:** READY TO SUBMIT — removal requests below can be filed via Yelp's "Report inaccurate info" / Yelp Support. No login or change has been made.

---

## Full Yelp listing inventory

| # | URL | Exact name shown | Address shown | Phone | Reviews | Rating | Category | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | https://www.yelp.com/biz/toyota-of-vero-beach-vero-beach-4 | TOYOTA OF VERO BEACH | 1075 S US Hwy 1 ✅ | (772) 252-5818 | **113** | 2.2 | Used Car Dealers | **KEEP (canonical Toyota)** |
| 2 | https://www.yelp.com/biz/toyota-of-vero-beach-vero-beach-3 | Toyota of Vero Beach Service Center | 1075 US Route 1 | (772) 291-0031 | **54** | 2.1 | Auto Repair | Duplicate-ish (separate service dept listing, same address) — see note |
| 3 | https://www.yelp.com/biz/kia-of-vero-beach-vero-beach-3 | KIA OF VERO BEACH | 1105 S US Highway 1 ✅ | (772) 291-0624 | **51** | 2.5 | Car Dealers | **KEEP (canonical Kia)** |
| 4 | https://www.yelp.com/biz/kia-of-vero-beach-service-vero-beach | KIA OF VERO BEACH SERVICE | ⚠️ **1175** S US Hwy 1 (WRONG — real is 1105) | (844) 921-3147 | 1 | 5.0 | Auto Repair | **REMOVE (wrong-address phantom)** |

### Notes on the inventory
- Google indexes a "113" and a "111" review variant of the main Toyota listing; both resolve to the **same** biz page `-4` (just snapshot timing). It is ONE listing, not two. Not a duplicate.
- The Yelp slug `toyota-of-vero-beach-vero-beach-3` is the **Service Center** (Auto Repair, 54 reviews), and `-4` is the **main dealership** (113 reviews). They are two distinct biz pages at the same 1075 address.
- No standalone legacy "Toyota Kia of Vero Beach" combined listing surfaced in the public index — the "toyota kia" phrasing only appears in Yelp's "people also search for" suggestions, not as a real biz page. Flag to confirm logged-in, but treat as non-existent for now.

---

## Canonical (KEEP) vs duplicates (REMOVE/MERGE)

**KEEP:**
- Toyota: `toyota-of-vero-beach-vero-beach-4` (113 reviews, correct 1075 NAP)
- Kia: `kia-of-vero-beach-vero-beach-3` (51 reviews, correct 1105 NAP)

**ACT ON:**
- **#4 Kia "Service" @ 1175 — REMOVE.** Phantom listing at a wrong address. Highest priority: it misdirects customers to a non-existent location.
- **#2 Toyota Service Center @ 1075 — consolidate.** This is a real-address service-dept duplicate of the main dealer. Yelp generally KEEPS distinct service-department listings as separate categories, so do NOT request hard deletion. Instead request a **merge into the main dealer listing** OR leave it and just correct its NAP to match (1075 S US Hwy 1, not "US Route 1"). Recommend: ask Yelp to merge #2 into #1; if Yelp declines (their policy often keeps service depts separate), standardize the address string to "1075 S US Hwy 1".

---

## Wrong-address evidence (Kia #4)

- Listing #4 shows **1175 S US Hwy 1**. The real, verified Kia of Vero Beach address is **1105 S US Hwy 1** (matches the canonical Kia listing #3, the dealer website kiaofverobeach.com, and Google Business Profile).
- The 1175 listing also carries an off-brand phone **(844) 921-3147** and only **1 review** — hallmark of a stray/auto-generated duplicate, not a real second location.

---

## Removal / correction request text (ready to submit)

### A) Kia "Service" wrong-address listing (#4) — REMOVE
Submit via the listing's **"Report inaccurate info" → "This business is a duplicate / does not exist at this location"** (or Yelp Support → Report a listing issue):

> This listing for "Kia of Vero Beach Service" shows the address 1175 S US Hwy 1, Vero Beach, FL 32962. That address is incorrect — Kia of Vero Beach is located at **1105 S US Hwy 1, Vero Beach, FL 32962** (phone (772) 291-0624), which is the verified address on the dealership's primary Yelp page (yelp.com/biz/kia-of-vero-beach-vero-beach-3), the dealer website kiaofverobeach.com, and the Google Business Profile. There is no Kia service location at 1175. This is a duplicate/phantom listing for the same business and should be removed (or merged into the primary Kia of Vero Beach listing). Please remove this inaccurate listing.

### B) Toyota Service Center listing (#2) — MERGE or CORRECT
Submit via #2's **"Report inaccurate info"**:

> This "Toyota of Vero Beach Service Center" listing (1075 US Route 1) is the service department of Toyota of Vero Beach, the same business as yelp.com/biz/toyota-of-vero-beach-vero-beach-4 at 1075 S US Hwy 1. Please merge this duplicate into the primary Toyota of Vero Beach dealership listing. If your policy keeps service departments as separate listings, please at minimum correct the address string to the standardized **1075 S US Hwy 1, Vero Beach, FL 32962** to match the dealership of record.

---

## Honest blockers / verification flags
- All review counts, addresses, and phones above were read from Yelp's **public metadata via Google's index** (logged-out). Yelp aggressively bots-blocks direct listing scraping, so individual Yelp biz pages were not opened one-by-one this pass — the figures are from Yelp's own indexed listing data and are reliable, but confirm review counts on each live page before submitting (counts drift).
- Whether Yelp will hard-remove vs merge the service-dept duplicate (#2) is at Yelp's discretion; the request is written to accept either outcome.
- Re-confirm logged-in that no separate legacy "Toyota Kia" combined biz page exists (none found publicly).
- Best filed from the **claimed Yelp Business account** for each dealership (owner-reported duplicates get faster action than anonymous reports). Confirm Jared has/claims Yelp for Business access during kickoff.
