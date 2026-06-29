# Local SEO Page Plan — Toyota of Vero Beach & Kia of Vero Beach
*2026-06-12 · Circuit Coders · DealerOn custom pages (additive only)*

> ⚠️ **STRATEGY UPDATE 2026-06-23 (competitive-audit.md) — read first, it overrides the Toyota benchmark below.**
> - **Bev Smith TOYOTA dropped its Vero near-me page** (it now 301s to Fort Pierce). The Toyota near-me conquest threat is GONE. The benchmark section below is stale on the Toyota side — keep only as a content-pattern reference.
> - **The real conquest threat is Bev Smith KIA:** `/kia-dealer-near-vero-beach-fl/` ranks pg 1 for "kia dealer vero beach" but is THIN (~520w, no FAQ/schema/drive-time/review quotes). Our drafted Kia Vero page beats it outright.
> - **SHIP ORDER CHANGED → Kia Vero (#4) FIRST**, then the commodity-leak fixes (service page + used/CPO — competitors outrank us on "oil change vero beach" / "used car dealer vero beach"), then Sebastian.
> - **One metric a competitor genuinely wins:** Kia review VOLUME (Boniface Hiers Kia 4.7/8,044 vs our 4.6/3,192) → review-gen is the #1 ongoing play, not optional.
> - Our structural edge over EVERY competitor city page: schema + FAQ + drive-time math + embedded review snippets — none of them have any. Don't ship a page without all four.

## Competitive benchmark: Bev Smith Toyota (Ft. Pierce) — ⚠️ STALE on Toyota, see update above
Indexed local landing pages found:
- `/toyota-dealer-serving-vero-beach-fl/` — **they target OUR city**
- `/toyota-dealer-serving-fort-pierce-fl.html`
- `/toyota-dealer-near-me-fort-pierce-fl.html`
- `/used-car-dealer-serving-fort-pierce-fl.html`
- ~10+ model pages: `/2025-toyota-camry-for-sale-fort-pierce-fl` ("…Serving Port St. Lucie, Vero Beach & Stuart")

**Their pattern**: ~1,200–1,400 words, H1 = "Toyota Dealer Serving [City]", ~7 H2 sections (inventory, financing, service/parts, why-buy), internal links to SRPs/finance/service scheduler, local landmark mentions (Jetty Park, Navy SEAL Museum). **No visible JSON-LD schema** — that's our edge. Their geo copy is generic ("serving X, Y, Z" stuffing).

**To beat them**: 1,400–1,800 words, genuinely local copy (drive times, neighborhoods, real landmarks), FAQPage + AutoDealer JSON-LD, review-snippet quotes, tighter internal-link silos.

## Priority matrix (search opportunity × competition gap)

| # | Store | Geo | Intent | Priority | Why |
|---|-------|-----|--------|----------|-----|
| 1 | Toyota | Vero Beach | New sales / "dealer near me" | P0 | Bev Smith ranks for OUR city; defend home turf |
| 2 | Toyota | Sebastian | New sales | P0 | Zero competition; Sebastian buyers must choose Vero vs Melbourne |
| 3 | Toyota | Vero Beach | Service | P0 | Highest-volume local intent; review themes = service pricing |
| 4 | Kia | Vero Beach | New sales / dealer near me | P0 | Only Kia store in Indian River County — own it |
| 5 | Kia | Sebastian | New sales + service combined | P1 | Sebastian Kia owners otherwise drive to Melbourne |
| 6 | Toyota | Fort Pierce | New sales (counter-attack) | P1 | Mirror Bev Smith's Vero page into their market |
| 7 | Toyota | Indian River County | Used/CPO | P1 | County-level used-car queries, low comp |
| 8 | Kia | Vero Beach | Service | P1 | Kia service deserts in IRC; Melbourne fringe capture |
| 9 | Toyota | Sebastian | Service + parts | P2 | Service-near-me from Sebastian/Fellsmere |
| 10 | Kia | Indian River County | Parts & accessories | P2 | Low volume but zero competition; parts dept revenue |

---

## Page specs

### 1. Toyota Dealer in Vero Beach, FL (P0)
- **Keywords**: toyota dealer vero beach, toyota dealership near me, toyota dealer indian river county, new toyota vero beach
- **URL**: `/toyota-dealer-vero-beach-fl/`
- **Title**: `Toyota Dealer in Vero Beach, FL | New & Used | Toyota of Vero Beach`
- **Meta**: `Your hometown Toyota dealer on US-1 in Vero Beach — new Toyota inventory, trade-ins, financing & factory service. Skip the drive to Fort Pierce or Melbourne.`
- **H1**: `Your Toyota Dealer in Vero Beach — Not 15 Miles Away`
- **Outline (~200w)**: Open on location advantage: the only Toyota store actually IN Vero Beach/Indian River County — competitors send you to Fort Pierce or Melbourne. H2 New Inventory: Camry, RAV4, Tacoma, Grand Highlander hybrids with links to live SRPs. H2 Why Buy Local: same-day test drives, local service relationship, community presence (Vero Beach landmarks: Ocean Drive, Riverside Park, McKee Botanical Garden — real references, not stuffing). H2 Financing: transparent finance office (tie to review-theme content), pre-qualify online. H2 Trade-In: instant appraisal. H2 Service After the Sale: link to service page. FAQ block (5 Qs: hours, directions from Sebastian/Fort Pierce, hybrid availability, trade-in process, financing with average credit).
- **Internal links**: new SRP, used SRP, finance app, service page (#3), Sebastian page (#2), trade-in tool.
- **Schema**: `AutoDealer` JSON-LD (name, address, geo, openingHours, telephone, sameAs→GBP/social, areaServed: Vero Beach/Sebastian/Indian River County) + `FAQPage` for FAQ block.

### 2. Toyota Dealer Serving Sebastian, FL (P0)
- **Keywords**: toyota dealer sebastian fl, toyota near sebastian, new toyota sebastian florida
- **URL**: `/toyota-dealer-sebastian-fl/`
- **Title**: `Toyota Dealer Serving Sebastian, FL — 20 Minutes Down US-1 | Toyota of Vero Beach`
- **Meta**: `Sebastian Toyota shoppers: skip Melbourne traffic. Toyota of Vero Beach is 20 minutes south on US-1 with full inventory, service & parts.`
- **H1**: `The Closest Toyota Dealer to Sebastian, FL`
- **Outline**: Open with drive-time math: 20 min south on US-1 vs 40+ min to Melbourne through traffic. H2 Inventory for Sebastian drivers (Tacoma/RAV4 for fishing & boating at Sebastian Inlet — genuine local hook). H2 Service Without the Trip: early-bird drop-off, loaners. H2 Sebastian & Fellsmere community ties. H2 Online-first buying: build the deal from home, one trip to sign. FAQ: distance/directions from Sebastian, Micco, Barefoot Bay; service shuttle radius.
- **Internal links**: page #1, service page #3, new SRP, scheduler.
- **Schema**: `AutoDealer` with `areaServed`: Sebastian, Micco, Barefoot Bay, Fellsmere + `FAQPage`.

### 3. Toyota Service Center — Vero Beach (P0)
- **Keywords**: toyota service vero beach, oil change vero beach, toyota repair near me, toyota service indian river county
- **URL**: `/toyota-service-vero-beach-fl/`
- **Title**: `Toyota Service in Vero Beach, FL | Upfront Pricing | Toyota of Vero Beach`
- **Meta**: `Factory-trained Toyota service in Vero Beach with published maintenance pricing. Oil changes, brakes, tires, hybrid batteries. Book online in 60 seconds.`
- **H1**: `Toyota Service in Vero Beach — Upfront Pricing, Factory Techs`
- **Outline**: Lead with the review-theme fix: published menu pricing for common services (oil change, tire rotation, brakes) — directly answers "service pricing clarity" complaints. H2 Services table with from-prices. H2 Why factory service vs independents (hybrid expertise, ToyotaCare). H2 While-you-wait amenities + shuttle radius (Vero, Sebastian, Fort Pierce north). H2 Service specials (link to live coupons). FAQ: how much is an oil change, do you service non-Toyotas, wait times, appointment vs walk-in.
- **Internal links**: scheduler, coupons/specials, parts, pages #1/#2.
- **Schema**: `AutoRepair` (subtype) JSON-LD + `FAQPage`; mark up offer prices on the menu if compliance allows.

### 4. Kia Dealer in Vero Beach, FL (P0)
- **Keywords**: kia dealer vero beach, kia dealership near me, kia indian river county, telluride vero beach
- **URL**: `/kia-dealer-vero-beach-fl/`
- **Title**: `Kia Dealer in Vero Beach, FL | The Only Kia Store in Indian River County`
- **Meta**: `Kia of Vero Beach — the only Kia dealer in Indian River County. Telluride, Sportage, EV9 in stock. New, used, financing & factory service on US-1.`
- **H1**: `Indian River County's Only Kia Dealer`
- **Outline**: Lead with exclusivity: only Kia store in the county — nearest alternatives are Melbourne and Fort Pierce. H2 Popular models in stock (Telluride, Sportage Hybrid, K5, EV9) → SRP links. H2 Kia warranty advantage (10-yr/100k). H2 Local financing transparency. H2 Service & parts under the same roof. FAQ: directions from Sebastian/Fort Pierce, EV charging, warranty coverage, lease vs buy.
- **Internal links**: Kia SRPs, finance, page #8 (Kia service), page #5.
- **Schema**: `AutoDealer` + `FAQPage`, `areaServed` all five geo targets.

### 5. Kia Dealer & Service Serving Sebastian, FL (P1)
- **Keywords**: kia dealer sebastian fl, kia service sebastian, kia near melbourne fl south
- **URL**: `/kia-dealer-sebastian-fl/`
- **Title**: `Kia Dealer Serving Sebastian & Barefoot Bay, FL | Kia of Vero Beach`
- **Meta**: `Closest Kia dealer & service center to Sebastian, FL. 20 minutes on US-1 — closer than Melbourne. Sales, service, parts & Kia warranty work.`
- **H1**: `The Closest Kia Dealer to Sebastian — Sales & Service`
- **Outline**: Combined sales+service page (volume doesn't justify two). Drive-time framing vs Melbourne. H2 Shop from Sebastian (online tools, home delivery if offered). H2 Warranty service close to home — 10-yr warranty means a long service relationship; choose the closer store. H2 Snowbird/Barefoot Bay angle: seasonal residents, storage checks. FAQ: warranty work eligibility anywhere, shuttle, drop-off.
- **Internal links**: #4, #8, Kia SRP, scheduler.
- **Schema**: `AutoDealer` with areaServed Sebastian/Micco/Barefoot Bay/Grant-Valkaria (Melbourne fringe) + `FAQPage`.

### 6. Toyota Dealer Serving Fort Pierce, FL (P1 — counter-attack)
- **Keywords**: toyota dealer fort pierce alternative, toyota near fort pierce, toyota vero beach vs fort pierce
- **URL**: `/toyota-dealer-serving-fort-pierce-fl/`
- **Title**: `Toyota Dealer Serving Fort Pierce, FL — Worth the Short Drive North`
- **Meta**: `Fort Pierce Toyota shoppers: compare us. Toyota of Vero Beach is 15 minutes north on US-1 with competitive pricing and a no-pressure finance office.`
- **H1**: `Fort Pierce's Other Toyota Option — 15 Minutes North`
- **Outline**: Mirror Bev Smith's play in reverse. H2 Why shoppers cross-shop (selection, second quote leverage — honest framing). H2 Inventory + price-match posture. H2 Finance office transparency (review-theme tie-in). H2 North-county convenience: Lakewood Park, St. Lucie Village residents are closer to us than to south Fort Pierce. FAQ: distance, trade-in from St. Lucie County, service eligibility.
- **Internal links**: #1, #3, SRPs, finance.
- **Schema**: `AutoDealer` areaServed Fort Pierce/Lakewood Park + `FAQPage`.

### 7. Used Cars & Toyota CPO — Indian River County (P1)
- **Keywords**: used cars vero beach, used toyota indian river county, certified pre-owned toyota vero beach, used trucks vero beach
- **URL**: `/used-cars-vero-beach-indian-river-county/`
- **Title**: `Used Cars & Certified Toyota in Vero Beach | Indian River County's Used Lot`
- **Meta**: `Shop used cars, trucks & Toyota Certified Pre-Owned in Vero Beach. 160-point inspections, local trade-ins, financing for every credit tier.`
- **H1**: `Used Cars in Vero Beach — Local Trades, Certified Toyotas`
- **Outline**: H2 What CPO means (160-pt inspection, warranty) vs plain used. H2 Local-trade sourcing — county one-owner cars, not auction units. H2 Under-$20k inventory link. H2 Financing all credit tiers (transparent terms — review-theme). FAQ: CPO warranty length, can I sell without buying, trade value process.
- **Internal links**: used SRP, CPO SRP, trade-in tool, #1, finance.
- **Schema**: `AutoDealer` + `FAQPage`.

### 8. Kia Service Center — Vero Beach (P1)
- **Keywords**: kia service vero beach, kia oil change near me, kia warranty service indian river county
- **URL**: `/kia-service-vero-beach-fl/`
- **Title**: `Kia Service in Vero Beach, FL | Factory Techs & Upfront Pricing`
- **Meta**: `The only factory Kia service center in Indian River County. Published pricing, genuine Kia parts, warranty & recall work. Serving Vero Beach to Sebastian.`
- **H1**: `Kia Service in Vero Beach — The County's Only Factory Shop`
- **Outline**: Exclusivity lead (only factory Kia service in IRC). H2 Published service-menu pricing (review-theme fix). H2 Warranty & recall work — why factory matters for the 10-yr warranty paper trail. H2 EV/hybrid certified techs (EV9, Niro, Sportage HEV). H2 Genuine parts counter. FAQ: pricing, recalls, loaners, non-Kia service.
- **Internal links**: scheduler, parts, #4, #5, coupons.
- **Schema**: `AutoRepair` + `FAQPage`.

### 9. Toyota Service & Parts Serving Sebastian (P2)
- **URL**: `/toyota-service-sebastian-fl/` · **Title**: `Toyota Service & Genuine Parts Near Sebastian, FL | Toyota of Vero Beach` · **H1**: `Toyota Service Near Sebastian — Closer Than Melbourne`
- **Keywords**: toyota service sebastian fl, toyota parts sebastian, oil change sebastian fl
- **Outline**: Compressed version of #3 with Sebastian drive-time framing; H2 parts counter & online parts ordering; H2 tire center; FAQ on shuttle radius and Saturday hours. Internal links: #2, #3, scheduler, parts order form. Schema: `AutoRepair` + `FAQPage`, areaServed Sebastian.

### 10. Kia Parts & Accessories — Indian River County (P2)
- **URL**: `/kia-parts-vero-beach-fl/` · **Title**: `Genuine Kia Parts & Accessories in Vero Beach, FL` · **H1**: `Genuine Kia Parts — Vero Beach Counter, County-Wide Pickup`
- **Keywords**: kia parts vero beach, kia accessories near me, genuine kia parts indian river county
- **Outline**: H2 why genuine vs aftermarket (warranty preservation); H2 popular accessories (cross-bars, cargo, floor liners for Telluride/Sportage); H2 order online / wholesale to local shops; FAQ on ordering, install pricing. Internal links: #4, #8, parts form. Schema: `AutoPartsStore` + `FAQPage`.

---

## Cross-cutting rules
- 1,400–1,800 words on P0 pages, 1,000+ on P1/P2 — always above Bev Smith's ~1,300.
- Every page: one `FAQPage` block (4–6 Qs), one review quote (real, attributed first name + month), one geo-genuine paragraph (no city-list stuffing).
- Schema injected as JSON-LD in a custom HTML block (see dealeron-capabilities.md test-first note).
- Interlink as silos: Toyota pages link Toyota pages; cross-store links only via "Saunders family of dealerships" footer line if compliance permits.
- Rollout: P0 (#1–4) in batch 1 to DealerOn; P1 batch 2 at week 3; P2 month 2.
