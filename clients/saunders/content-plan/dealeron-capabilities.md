# DealerOn Capabilities & Constraints — Saunders (Toyota/Kia of Vero Beach)
*Researched 2026-06-12*

## Platform context
- Both rooftops are on DealerOn-hosted sites. DealerOn is an OEM-approved website provider for both the **Toyota Dealer Digital program** (dealeron.com/toyota) and Stellantis/GM programs; Kia sites run on the same Cosmos stack. OEM program rules apply (brand compliance review on creative, no replacing core platform templates).
- **Cosmos platform** (DealerOn's current CMS) lets dealers/agencies "create and sync specials, update business profiles, and generate creative and landing pages without leaving their website." This means custom landing pages CAN be added self-serve or via the dealer's DealerOn account rep — we don't need platform replacement.

## What we can do
- **Add custom pages** with custom URL slug, title tag, meta description, H1, body HTML, images, and forms — via Cosmos page builder or a DealerOn support ticket through the dealer's rep.
- **Custom HTML blocks** on pages → we can embed our own JSON-LD schema (`AutoDealer`, `AutoRepair`, `FAQPage`) in a content block. Verify after publish that DealerOn doesn't strip `<script type="application/ld+json">`; if it does, request schema injection via the support ticket route.
- **Internal linking**: full control within body copy; can also request nav/footer link additions (these typically go through support and OEM compliance).
- DealerOn offers a paid managed SEO/blogging add-on (6–8 posts/mo). **We replace that** — Saunders pays us, not the upsell.

## Constraints / gotchas
1. **Support-ticket turnaround**: industry reporting (A3 Brands CMS comparison, 2026) flags that ticket-based custom page publishing "slows your program by weeks per page." Plan: batch page requests (submit all 9 specs in one ticket), and push for Cosmos self-serve access for the agency login at kickoff.
2. **OEM compliance**: Toyota (TDDS) and Kia digital programs review custom content; avoid price claims that conflict with OEM rules, use approved model imagery (Toyota provides asset libraries).
3. **Template model pages are thin**: DealerOn auto-generates model/SRP pages that rank only for brand queries. Our custom pages must be 800+ words unique content to outrank Bev Smith (theirs run ~1,200–1,400 words).
4. **URL structure**: DealerOn supports both `/slug.html` and `/slug/` patterns (Bev Smith uses both). Request extensionless trailing-slash URLs for cleanliness; either works.
5. **Cannot**: replace platform header/footer/SRP/VDP templates, alter robots/sitemap directly (request via ticket), or self-host scripts outside approved tags.

## Action items at kickoff
- [ ] Get agency added as a Cosmos user on both rooftop accounts (Jared authorizes with DealerOn rep).
- [ ] Confirm whether JSON-LD survives in custom HTML blocks (publish 1 test page first).
- [ ] Submit all page specs in one batched ticket if self-serve access is delayed.
- [ ] Ask the rep for the current custom-page SLA in writing (expect 5–15 business days/batch).

Sources: dealeron.com/cosmos, dealeron.com/toyota, dealeron.com/features-and-upgrades, a3brands.com/blog/best-cms-dealership-websites, forum.dealerrefresh.com SEO checklist thread.
