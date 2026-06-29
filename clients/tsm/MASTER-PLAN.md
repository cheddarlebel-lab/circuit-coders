# TSM Collision — Master Delivery Plan
*The single source of truth for this engagement. Updated as things ship. (Supersedes BUILD-PLAN.md as the full doc; that file stays the quick checklist.)*

Client: **Efrain Vasquez** · TSM Collision, 42371 Avenida Alvarado, Temecula CA 92590 · shop line (951) 696-4445
Closed: **2026-06-24** · CC owner: Leo Lebel

---

## 1. Deal terms (what's in / out / paid)
- **$2,500/mo** recurring, month-to-month. Setup fee **WAIVED** (closing lever).
- **2 months PREPAID = $5,000 collected** 2026-06-24. (Method TBD — reconcile vs Stripe.)
- **Phone usage** metered separately at **$0.25/min** of talk time (passthrough; typically ~$75–250/mo). NOT part of the $2,500.
- **Ads: PARKED.** Google/Meta management on hold; ad spend (his money, at cost) only when he switches it on — added later, not in current $2,500.
- Included now: AI phone receptionist · review engine · status texts · lead follow-up · booking form · dashboard · local SEO · on-site AI chat · website (fix now, rebuild later).

## 2. Module status board
| # | Module | Phase | Status | Gated on |
|---|--------|-------|--------|----------|
| 1 | AI Phone Receptionist | — | ✅ **LIVE** (951) 517-4156, IVR menu | — |
| 2 | Review-Request Engine | 1 | 🔁 **Primary = CCC UpdatePlus (native Google Reviews)**; Twilio engine = backup (built, dry-run works) | CCC login + UpdatePlus enabled |
| 3 | Online Booking Form | 1 | ⏳ Not started | Wix admin + calendar |
| 4 | On-Site AI Chat | 1 | ⏳ Not started | Wix admin |
| 5 | Repair-Status Texts | 2 | ⏳ **Via CCC UpdatePlus** (native) — see ccc-updateplus-playbook.md | CCC login + UpdatePlus enabled |
| 6 | Lead Follow-Up Automation | 2 | ⏳ Not started | #2/#3 live first |
| 7 | Dashboard & Reporting | 2 | ⏳ Not started | data sources live |
| 8 | Local SEO + GBP | 3 | ⏳ Not started | GBP manager + Wix admin |
| 9 | Website (fix → rebuild) | 1 then 3 | ⏳ Not started | Wix admin (fix) / domain+photos (rebuild) |
| 10 | Paid Ads | later | ⏸️ Parked | Efrain switches on + ad accounts |

## 3. Timeline (realistic, solo build)
**Phase 0 — Access (Day 1–2):** GBP Manager · Wix Admin · calendar · CCC login verified · Twilio account · pick "job done" trigger.
**Phase 1 — Visible wins (Week 1):** Review engine live · booking form · on-site chat · Wix quick-fixes (H1, schema, email bug). → *He sees reviews flowing + leads captured by end of week 1.*
**Phase 2 — Workflow (Week 2–3):** Status texts · lead follow-up · dashboard. → *He sees proof it's working.*
**Phase 3 — Long game (Week 2 onward, matures 3–6 mo):** Local SEO + "near me" pages · website rebuild (Next.js) with 301 redirects.
**Ads:** fast add whenever he greenlights.

## 4. Website decision — FIX FIRST, REBUILD LATER
Current site: Wix, loads OK, decent meta, but: H1 is literally "Gallery", **no LocalBusiness schema**, broken `mailto:_info@` email link, a stray hardcoded personal Google-search link, **0 forms / no chat**, ~1.4 MB (slow).
- **Phase 1 (now):** fix on Wix — rewrite H1 (keyword+location), add LocalBusiness JSON-LD, fix email link, remove stray Google link, embed booking form + chat, compress images. Fast SEO + conversion wins, no migration risk.
- **Phase 3 (later):** rebuild on Next.js (our stack — speed, SEO control, native booking/chat, premium design, we own it). **301-redirect every old URL** to preserve the SEO gains. Needs his domain/DNS access + photos/content.
- *Rationale: don't burn the prepaid window on a slow rebuild; bank early wins, then upgrade deliberately.*

## 5. Tech stack
- **Phone:** Retell (agent "Tessa", GPT-5.1, voice Marissa) + Twilio number (951) 517-4156. IVR: 1 status / 2 estimate / 3 front-desk transfer → (951) 696-4445.
- **SMS (reviews/status/follow-up):** Twilio (own account) via `clients/tsm/review-engine/`.
- **Data/dashboard:** Supabase + a Next.js page (hosted on circuitcoders.com or a client subdomain).
- **Reviews:** Google Business Profile review link + GBP API.
- **Website:** Wix now → Next.js rebuild later.
- **CCC ONE:** shop login (visibility + customer pulls). **No Secure Share** at one-shop scale; automation rides front-desk "mark done" trigger.

## 6. Costs (so margin is never a surprise)
**Ours (COGS, monthly):** Retell+Twilio phone usage (covered by his $0.25/min passthrough) · Twilio SMS number ~$1–2/mo + ~$0.008/text · Supabase free tier · Vercel hosting free/cheap. **Net COGS: tens of $/mo vs $2,500/mo → strong margin.**
**His:** $2,500/mo + phone usage $0.25/min + (later) ad spend at cost.

## 7. What we report (dashboard KPIs = retention proof)
Calls answered · leads captured · estimates booked · review requests sent vs reviews earned · status texts sent · follow-ups · (later) SEO rank movement + ad performance. Monthly summary to Efrain.

## 8. Access still needed from Efrain (Phase 0)
Per the guide at https://www.circuitcoders.com/docs/tsm-access.html — GBP Manager · Wix Admin · calendar. (CCC login: ✅ have it. Twilio: ours to set up.)

## 9. Risks & open flags
- ⚠️ **Test the IVR keypad** on a real call (DTMF) — spoken routing confirmed, pressed-digit not yet.
- ⚠️ **Front-desk transfer loop:** at go-live, if shop line forwards INTO the AI, pressing 3 → loop. Need a separate human destination then (cell / non-forwarded line).
- ⚠️ **$5,000 payment method TBD** — confirm + reconcile vs Stripe.
- ⚠️ **Spanish QA** — test bilingual on real calls before leaning on it.
- ⚠️ **No-price guardrail** — keep verifying the bot never quotes repair prices.
- ⚠️ **SEO migration** at rebuild — 301 everything, don't reset rankings.
- ⚠️ **SMS compliance** — only text real customers, include STOP opt-out (already in template).

## 10. Open decisions / TODO
- [ ] Confirm $5,000 payment method + reconcile
- [ ] Set up Twilio account (SID/token/SMS number)
- [ ] Get GBP Manager access → grab review link/place ID
- [ ] Get Wix Admin access → start quick-fixes
- [ ] Verify CCC login works + locate completed-jobs data
- [ ] Test-call IVR, confirm DTMF + transfer
- [ ] Decide client subdomain for dashboard

## 11. Churn-protection milestones (he prepaid 2 mo)
- **End Week 1:** reviews flowing + site capturing leads + Wix fixes visible.
- **End Week 3:** dashboard live showing real numbers.
- **Month 2:** SEO movement starting, rebuild underway → renewal is a no-brainer.
