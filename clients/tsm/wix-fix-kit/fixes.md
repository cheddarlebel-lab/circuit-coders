# Wix Fix Kit — TSM Collision (ready to apply the moment we have Wix Admin)

All prepped so the Phase-1 Wix session is fast. Apply in order.

## 1. 🔴 Rewrite the H1 (currently "Gallery")
The homepage H1 is wasted on the word "Gallery." Change the homepage's main heading to a keyword + location headline. Recommended:
> **Auto Body & Collision Repair in Temecula, CA**
(sub/H2 under it, if wanted): *Expert paint, dent & frame repair — free estimates, all insurance welcome.*
- In Wix: open Homepage → click the top headline text → set it to an **H1** with the copy above. Keep "Gallery" as a section heading lower down (H2).

## 2. 🔴 Fix the broken email link
Current link: `mailto:_info@tsmcollision.com` (leading underscore = dead). 
- Confirm the real address with Efrain (likely `info@tsmcollision.com`).
- In Wix: find the email element/button → update the link to the correct `mailto:`.

## 3. 🔴 Add LocalBusiness schema (the map-pack gap)
Paste the contents of `localbusiness-schema.json` into the site's custom code (Wix: **Settings → Custom Code → Add Custom Code → Body/Head, all pages** — or the homepage's SEO "structured data" field).
- ⚠️ **Verify the geo coordinates** (lat 33.5089 / long -117.1697 are approximate for Temecula) — grab exact from the Google Business Profile pin.
- ⚠️ Confirm hours still Mon–Fri 8–5 (no Sat). Update if changed.

## 4. 🟠 Remove the stray personal Google-search link
There's a hardcoded link to someone's personal Google search (`google.com/search?q=tsm+collision&rlz=1C5CHFA...` with a session token). Find and delete it (or repoint to the Google Business Profile / review link).

## 5. 🟠 Compress images (page is ~1.4 MB → slow on mobile)
- Wix: enable image optimization / replace oversized hero images. Target < 700 KB total above-the-fold. Helps mobile speed (a ranking factor).

## 6. 🟠 Add lead capture (Phase-1 modules)
- **Booking/estimate form** → Wix Forms or embed, route to calendar + alert.
- **On-site AI chat** → embed widget.
(These are the separate Phase-1 builds; the site just needs to host them.)

## After applying
- Re-test in Google Rich Results Test (schema), PageSpeed Insights (mobile), and click every email/phone link.
- Note what changed for the monthly report (shows Efrain immediate competence).
