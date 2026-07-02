# Circuit Coders — Meta Ads Campaign (paste-ready, 2026-07-01)

Budget $200 total (~$6.50/day). ONE campaign, ONE ad set, 2-3 ads to let Meta find the winner.
Creatives in `content-engine/out/` + hosted at `circuitcoders.com/ads/<file>` (if Ads Manager upload
chokes, "add from URL"). All drive to the /start funnel + demo line (760) 546-9189.

## CAMPAIGN
- **Objective:** Leads (or Traffic if the pixel isn't firing — see note). Advantage campaign budget ON.
- **Name:** CC — Auto/Collision — Jul 2026
- **Daily budget:** $6.50 (or $45/week). Schedule: run continuously, review at day 7.

## AD SET  (name: Auto shops — SoCal)
- **Location:** start tight where CC has proof + can service — Temecula, Murrieta, Menifee, Hemet,
  Oceanside, Vista, Carlsbad, Riverside (25mi radius). Add Vero Beach FL only if scaling (Saunders proof).
- **Age:** 30–60. **Gender:** All.
- **Detailed targeting:** interests/behaviors — Auto repair, Collision repair, Automotive industry,
  Small business owners, Facebook Page admins. Layer "narrow audience" → must ALSO match small-biz-owner.
- **Exclude:** job seekers / "jobs" interests.
- **Placements:** Advantage+ (let Meta optimize) — Feed + Reels + Stories carry the 4:5 images and 9:16 videos.
- **Optimization:** Leads → conversion event = lead form submit (needs pixel) OR link clicks (Traffic).

## THE ADS (creative → copy). Meta fields: Primary text / Headline (≤40) / Description (≤30) / Button.

### AD 1 — Missed call (HERO, run first)  → `ad-missedcall.png` OR `missed-call.mp4`
- **Primary text:** Every call you miss is a job walking to the shop down the street. We give auto shops a 24/7 AI receptionist that answers, books the job, and texts you the details — plus a Google profile that actually shows up. Free shop audit, no obligation. Hear the AI answer a real call right now: (760) 546-9189.
- **Headline:** Stop losing jobs to voicemail
- **Description:** Free shop audit + live AI demo
- **Button:** Learn More
- **URL:** https://circuitcoders.com/start?utm_source=meta&utm_medium=cpc&utm_campaign=auto-jul&utm_content=missedcall

### AD 2 — Collision-specific  → `ad-collision.png`
- **Primary text:** A single collision job is worth thousands — and most shops lose them to a missed call after 5pm. Our AI receptionist answers every call 24/7, qualifies the job, and texts you the details. Hear it live: (760) 546-9189. Free shop audit, no obligation.
- **Headline:** Never miss a collision job
- **Description:** AI answers every call, 24/7
- **Button:** Learn More
- **URL:** …&utm_content=collision

### AD 3 — Maps gap  → `ad-mapsgap.png` OR `maps-gap.mp4`
- **Primary text:** Type your shop into Google. Not in the top 3? Your competitors are taking those jobs. We fix your Google Business Profile and build a site that ranks for [city] auto repair — and add an AI receptionist so no call goes to voicemail. Free audit shows exactly what's costing you customers.
- **Headline:** Invisible on Google Maps?
- **Description:** See where you rank — free
- **Button:** Learn More
- **URL:** …&utm_content=mapsgap

### (Bench) AD 4 — After-hours → `ad-afterhours.png` — swap in if AD1 fatigues.

## CREATIVE LIBRARY
Images (1080×1350, 4:5): out/ad-missedcall.png · ad-collision.png · ad-mapsgap.png · ad-afterhours.png
Videos (1080×1920, 9:16): missed-call.mp4 (25s) · maps-gap.mp4 (23s) · cinematic-ad.mp4 (Higgsfield b-roll)
Regenerate images: `bash gen_ads_v2.sh`. Edit copy = the render_ad lines.

## ⚠️ PIXEL GAP (decide before launch)
/start has NO Meta Pixel, so "Leads" optimization can't see conversions and the $200 optimizes blind.
Two options: (a) fastest — run **Traffic** objective to /start (clicks + demo-line calls are the signal,
fine at $6.50/day); (b) better — add the Meta Pixel + a "Lead" event fire on /start form submit
(~20 min, agent can do it) then run Leads. For $200, (a) is acceptable; do (b) if scaling past this test.

## LAUNCH STEPS (Ads Manager, Leo logged in)
1. Create campaign → objective per above → name it.
2. Ad set: budget $6.50/day, location/age/targeting above, Advantage+ placements.
3. Ad 1: upload `ad-missedcall.png` (or missed-call.mp4), paste primary/headline/desc, button Learn More, URL with UTM.
4. Duplicate → Ad 2 (collision), Ad 3 (maps). Publish.
5. Day 7: keep the lowest cost-per-result, cut the rest. Gate: cost-per-lead < first-month revenue per close ($797+).

## HONEST NOTE
$200 buys a signal, not a pipeline — expect a handful of leads/demo-calls, enough to learn CAC and which
angle lands. The warm collision calls (Ikon/All Valley/TSM) remain the July revenue driver; this runs in
parallel and compounds. Pair with posting the same video organically (free reach, doubles the creative).
