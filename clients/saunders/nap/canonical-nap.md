# Canonical NAP — Saunders Dealerships (Vero Beach)
Date: 2026-06-12. Companion files: `citation-audit.md`, `domain-audit.md`.

## Canonical records (proposed)

### Toyota of Vero Beach
| Field | Canonical value | Rationale |
|---|---|---|
| Name | **Toyota of Vero Beach** | Matches GBP/own-site identity; dominant variant across citations. Never "Toyota Kia of Vero Beach" (aggregator mash-up) or "Vero Beach Toyota" (that's only the domain). |
| Address | **1075 S US Hwy 1, Vero Beach, FL 32962** | Confirmed on own site + OEM locator. Use exactly this abbreviation style everywhere. |
| Phone | **772-569-8000** (main) | Longstanding main line, shown on Toyota.com OEM locator — the highest-authority citation and the number Google trusts most. All other 772-291/617/732 numbers found are call-tracking (DealerOn/Cars.com/mobile) and must never appear in citation NAP fields. **Confirm with Jared that 569-8000 still rings the BDC before propagating.** |
| Website | **https://www.verobeachtoyota.com** (root, https, www-consistent) | Live DealerOn primary. |
| Hours | Pull from GBP at kickoff and treat GBP as master; mirror everywhere (sales vs service hours kept separate where sources allow). |

### Kia of Vero Beach
| Field | Canonical value | Rationale |
|---|---|---|
| Name | **Kia of Vero Beach** | Matches own-site/GBP identity. |
| Address | **1105 S US Hwy 1, Vero Beach, FL 32962** | Confirmed; fix DealerRater (shows 1075), Yelp service listing (1175), BBB ZIP (32960). |
| Phone | **772-291-0031** (main) | The number the dealership itself publishes site-wide as the Kia sales line and the JSON-LD value; Apple Maps (the one fully clean citation) matches it. Kia has no legacy OEM-locator number with stronger provenance. **Verify it's a real DID, not DealerOn tracking, before mass-propagation — if tracking, port/claim it as the permanent main line rather than renumbering 12 citations.** |
| Website | **https://www.kiaofverobeach.com** | Live DealerOn primary. |
| Hours | GBP as master, mirror everywhere. |

**Department numbers** (OK on own website/GBP secondary fields, never as the citation main phone): Toyota parts 772-770-9888; service lines as confirmed by client.

## Per-source fix list

| Source | Store(s) | Fix | Method |
|---|---|---|---|
| Google Business Profile | Both | Set as master: name/address/canonical phone/website/hours. Toyota GBP shows 206-4571 — replace with 772-569-8000 unless client wants GBP call tracking (then use GBP's native tracking field, primary = canonical). | Self-serve (requires GBP manager access from client) |
| Toyota.com locator | Toyota | Already 569-8000 — confirm address/website current. Changes go through the dealer's Toyota DealerDaily/region rep. | OEM portal / rep ticket |
| Kia.com locator | Kia | Unverifiable via fetch — check in browser; corrections via KDealer portal/rep. | OEM portal / rep ticket |
| Yelp | Both | Toyota shows 252-5818; Kia has a phantom "Kia Service" listing at 1175 S US Hwy 1 — claim both pages, fix phone, close/merge duplicate. | Self-serve via Yelp for Business (claim required) |
| DealerRater | Kia | Shows Toyota's 1075 address + orphan 772-360-4033. | Claimed dealer panel; else DealerRater support ticket |
| Cars.com | Both | 617-xxxx and 888 numbers are Cars.com-injected tracking — expected; just ensure the underlying profile NAP (address/website) is right. | Dealer account / rep |
| CARFAX | Both | 403 to fetch — verify in browser; fix via CARFAX dealer account. | Dealer account |
| Facebook | Both | 4+ Kia pages incl. one with Georgia 912-381-8422 — claim/merge duplicates, set canonical NAP on the real pages. | Self-serve (page admin); duplicate removal = FB support flow |
| BBB | Both | Kia ZIP 32960→32962; entity listed as "S S and M Automotive, Inc." with Kia as alternate name. F-rating exists — do NOT engage publicly per standing rule; NAP fix only. | BBB business update form / support |
| Apple Maps | Kia clean; Toyota unverified | Verify Toyota via Apple Business Connect; claim both. | Self-serve (Apple Business Connect, requires verification) |
| Foursquare | Both | Login-walled — fix via Foursquare/Placemaker claim. Feeds Apple/Uber ecosystems. | Self-serve claim |
| YellowPages | Toyota | Two duplicate listing IDs — claim, merge, correct. | Self-serve claim / support for merge |
| MapQuest | Both | JS-only, unverified — check in browser; corrections via MapQuest claim or its data supplier (Foursquare/HERE). | Self-serve claim |
| Aggregators (AutoTrader, CarGurus, KBB, Carwise) | Both | All show "Toyota Kia of Vero Beach" combined name — request split/correct naming. | Dealer account / support ticket each |
| Data aggregators (Data Axle, Neustar/Localeze, Foursquare) | Both | Push canonical record upstream so fixes stick (or use Yext-style sync for the $2,950/mo retainer deliverable). | Self-serve submission per aggregator |

## Order of operations
1. Client confirms canonical phones (569-8000 live? 291-0031 real DID?).
2. Lock GBP first (master record), then OEM locators, then Yelp/FB/Apple, then long tail + aggregators.
3. Re-sweep at day 30; citation consistency is a reportable retainer KPI.
