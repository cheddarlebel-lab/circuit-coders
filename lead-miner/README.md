# Lead Miner — Google Maps → audited, scored, deduped leads

Replaces hand-mining prospects one at a time. One run = ~150-200 raw listings →
ranked email-fireable + call lists with machine-verified pitch hooks.

## Why Maps
Per the GMB-hijack memo and 2026-06-10 growth research: the highest-value lead is a
business with real Maps presence (rating + reviews + phone) and a missing/broken/template
website. Maps shows the Website chip per listing → presence/absence is the first filter.

## Pipeline

**1. Mine (agent-driven, needs live Chrome session):**
- Navigate `google.com/maps/search/<vertical>+<city>+CA`, wait ~6s
- Scroll the results feed (computer scroll at panel ~(230,500), 2×10 ticks, 5s waits)
- Run the extractor JS (see `extract.js` below) — pulls [name, website host, phone, rating, reviews, sponsored]
- Click search box (195,31) to focus doc, then JS writes JSON to clipboard → `pbpaste > raw-<query>.json`
- NOTE: Maps throttles pagination after a few queries (~13-22/query instead of 60+).
  Spread queries out or accept first-page results — they're the most prominent listings anyway.
- DLP blocks returning maps place URLs through tool results — return hostnames only.

**2. Audit + score (fully automated):**
```
python3 lead-audit.py
```
- Dedupes within run + against ALL prior outreach (sent.jsonl + followups.jsonl, by name/domain)
- Treats facebook/yelp/linktree-as-website as no-website
- Fetches each site: dead-site detection, cheap-TLD/GBP-hijack flag (.lol/.homes/.store...),
  builder templates (Wix/GoDaddy/SpotHopper/Squarespace), broken WP shortcodes, placeholder
  images, no HTTPS, no viewport, no CSLB #, no founding year, no embedded reviews
- Harvests emails (homepage + /contact + /about, same-domain or freemail only), MX-verifies
- Scores: defects×10 + email+25 + dead+25 + hijack+20 + rating/review sweet spots
- Output: `mined-leads.jsonl` + `LEADS-<date>.md` (🔥 email-fireable / 📞 call list)

**3. Pitch (agent writes, never template-blasts):**
- Hand-write pitches from each lead's `hooks` (they're machine-verified, but sanity-check phrasing)
- Save batch JSON: [{prospect, email, vertical, website, subject, body}]
- `python3 ../send-batch.py outreach-log/batch-N.json --dry-run` then live
- Sends log to sent.jsonl (channel gmail-api) → gmail-reply-monitor auto-watches threads

## ⚠ Gotchas
- **GBP-hijacked listings (cheap TLD): do NOT email the domain** — that's the hijacker's
  inbox, not the business. Call the listing phone instead. (Narcy Pro / roofingcompany.lol case.)
- Gmail OAuth tokens expire every 7 days (GCP testing mode). Re-auth: `../oauth-refresh.py`
  url/serve/exchange + Chrome consent click-through. Agent can do it solo.
- Defect detection is heuristic — re-verify any hook you put in writing.
- Queries already mined (2026-06-11): roofing Oceanside, plumber Vista, landscaping Fallbrook,
  auto detailing Carlsbad, HVAC San Marcos, electrician Escondido, painting Oceanside.
  Fresh territory: Encinitas, Carlsbad GC/remodel, Temecula, Murrieta, fencing/concrete/tree
  verticals, restaurants/cafes (different pitch), gyms, salons/barbers, dentists/chiro.

## extract.js (run via javascript_tool on a Maps search page)
```js
(async () => { const ext = [...document.querySelectorAll('a.hfpxzc')].map(a => {
  const card = a.closest('div[role="feed"] > div') || a.parentElement;
  const txt = card ? card.innerText : '';
  const m = txt.match(/(\d\.\d)\((\d[\d,]*)\)/);
  let site = card?.querySelector('a[data-value="Website"]')?.href || null;
  try { if (site) site = new URL(site).hostname; } catch(e) {}
  return [a.getAttribute('aria-label'), site, (txt.match(/\(\d{3}\) \d{3}-\d{4}/) || [null])[0],
          m ? m[1] : null, m ? m[2] : null, /^Sponsored$/m.test(txt) ? 1 : 0]; });
  await navigator.clipboard.writeText(JSON.stringify({query: 'QUERY HERE', items: ext}));
  return 'CLIPBOARD_OK ' + ext.length; })()
```

## ⚠ REPAIR 2026-06-19 (extract.js → extract-v2.js)
Google Maps changed its DOM + tightened anti-bot:
- **Inline "Website" chip REMOVED from feed cards.** Cards now expose only name, rating,
  review count, category, address, phone, review snippet. → Use `extract-v2.js` (verified
  working: returns those fields cleanly).
- **Place DETAIL panel does NOT render under automation** (clicking a card leaves panel on
  "Results", no website node). So website/email can no longer be harvested from Maps in-session.
- **Feed throttled to ~4 cards** in automated sessions (anti-bot). Eases with cooldown/spacing
  or a logged-in human Chrome session.
CONSEQUENCE: the email pipeline (lead-audit.py harvests emails FROM the website) is broken at
the source — no websites from Maps. To restore EMAIL outreach, add a website-resolution step
(web-search each "name + city" → official domain) then feed domains to lead-audit.py. Phone is
still captured → extract-v2 alone = a working CALL list.
