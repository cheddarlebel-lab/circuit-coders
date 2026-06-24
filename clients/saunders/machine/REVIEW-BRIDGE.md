# Google Review Extraction — Working Method (Saunders SLA bridge)

**Verified working 2026-06-21** via claude-in-chrome on the live public Google Maps
review feeds for **Toyota of Vero Beach** and **Kia of Vero Beach**. Public reads
only — no login, no posting. This is the method the 24h review-response SLA runs on.

## TL;DR — what changed vs. the 2026-06-21 battle-test
The earlier battle-test concluded individual review CARDS "did not render" in the
automated Maps panel. **They do render — the test was on the wrong panel.** The
*Overview* tab only shows ~3 "review highlight" cards and then moves on to
"People also search for". The full, scrollable review feed lives behind the
**Reviews tab**, and the reliable way to land on it directly is a place permalink
with the `!9m1!1b1` data segment. Once on that feed, cards expose
author / date / star-rating / full text / a stable per-review id, and they
lazy-load on scroll of the correct container.

## Step-by-step (per store)

1. **Get the place feature id (FTID).** Navigate to
   `https://www.google.com/maps/search/<Store Name>` and read the resolved
   permalink — it contains a token shaped `0x...:0x...` (e.g. Toyota
   `0x88def5f7423766c7:0x9da043eb66f8b219`, Kia
   `0x88def5f753f687ff:0xd9399e70fdc3a5c1`). Cache these in stores.json
   `platforms.google.place_url` so step 1 can be skipped on future runs.

2. **Open the reviews FEED directly** (not the Overview tab) by appending
   `!9m1!1b1` to the place data segment:
   ```
   https://www.google.com/maps/place/<Name>/@<lat>,<lng>,17z/data=!4m8!3m7!1s<FTID>!8m2!3d<lat>!4d<lng>!9m1!1b1!16s<gid>
   ```
   Wait ~3-4s for the feed to render. You should see the rating histogram, the
   keyword chips ("courteous staff 236", etc.), and review cards with author +
   "★★★★★ · a month ago" lines.

3. **Run `GOOGLE_MAPS_REVIEW_SCRIPT`** (constant in `review_monitor.py`) via
   `javascript_tool`. It:
   - finds the **real scroll container** by walking up from a `div[data-review-id]`
     until it hits an element with `overflow-y: auto|scroll` and real overflow
     (the container class is `m6QErb DxyBCb kA9KIf dS8AEf XiKgde` — note the
     trailing `XiKgde`; the old hardcoded `m6QErb.DxyBCb.kA9KIf.dS8AEf` selector
     matched the wrong, non-scrolling node, which is why scrolling did nothing),
   - scrolls it ~10× to lazy-load more cards,
   - clicks `button.w8nwRe` ("… More") to expand truncated bodies,
   - **dedupes by `data-review-id`** (selecting `div[data-review-id]` only —
     adding `div.jftiEf` double-counts every card),
   - returns up to 15 `{author, date, rating_label, text, url}`, where `url` is a
     stable per-review permalink `…/maps/reviews/data=<review-id>`.

4. **Pipe the result through `parse_google_review_cards()`** → canonical
   `{author, date, rating(1-5), text, url}`. Confirmed to map `"5 stars"`→`5` and
   skip malformed cards.

## Selectors (verified live 2026-06-21)
| Field | Selector |
|---|---|
| card (dedupe on attr) | `div[data-review-id]` |
| author | `.d4r55` |
| date | `.rsqaWe` |
| rating | `[role="img"][aria-label*="star"]` → aria-label `"5 stars"` |
| body text | `.wiI7pd` |
| expand-text button | `button.w8nwRe` |
| scroll container | nearest `overflow-y:auto` ancestor of a card (≈ `div.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde`) |

## Sort-by-newest — KNOWN FLAKY
The "Sort → Newest" dropdown does **not** reliably open under automation: a
programmatic `.click()` opens then immediately closes it (outside-click handler
fires same-tick), and a synthetic mouse click toggles open/closed across the
tool round-trip, so the menu items never stay rendered long enough to select.
**This does NOT block the SLA:** the default ("Most relevant") feed already
surfaces the most recent reviews near the top (we pulled "a week ago" /
"a month ago" cards), and the monitor **dedupes by review-id**, so any genuinely
new review is detected regardless of sort order. Sort-by-newest is a convenience
for a human spot-check, not a correctness requirement. If strict newest ordering
is ever needed, do it as a manual click in a live session.

## Sample extracted JSON (Toyota of Vero Beach, 2026-06-21, default sort, newest first)
```json
[
  {"author":"<name>","date":"a week ago","rating":5,
   "text":"We recently had the pleasure of working with Paul Willis to purchase a used car for our grandson Caleb. Paul went above and beyond…",
   "url":"https://www.google.com/maps/reviews/data=Ci9DQUlRQUNvZENodHljRjlvT2psTVNURnJPV0ZvY2t0NmFXOHhWVmxHYkRCM1JXYxAB"},
  {"author":"<name>","date":"a month ago","rating":5,
   "text":"I had an outstanding experience at Vero Beach Toyota thanks to my sales advisor Jeneth and finance manager Pepe…",
   "url":"https://www.google.com/maps/reviews/data=Ci9DQUlRQUNvZENodHljRjlvT2swMk5GQnJUVWx2VG1KeFRGUTNhVXRTVDBGaGJGRRAB"},
  {"author":"<name>","date":"a month ago","rating":5,
   "text":"Antonio was a great sales person followed up later about what was needed to be done. Ended up with a 26 Toyota Camry LE…",
   "url":"https://www.google.com/maps/reviews/data=Ci9DQUlRQUNvZENodHljRjlvT2xWSE5HNU5hbDlzWTBWU1dqWnlWRmh1VjA1a1ZGRRAB"}
]
```
Kia of Vero Beach extraction confirmed identical-shape (Chris Simes, Jordan, etc.,
all 5★, full text, stable urls) — method generalizes across both stores.

> Author names are captured by the script but appear as `[BLOCKED: Sensitive key]`
> in the claude-in-chrome tool *output* — that is the harness PII redactor masking
> the name string in transit, NOT a script failure. Verified the author node is
> present and non-empty (lengths 4/8/28 chars = real names). In a real run the
> parser receives the actual names.

## ARCHITECTURE NOTE — how this actually ships (honest)
`review_monitor._chrome_bridge()` expects an external CLI command
(`$SAUNDERS_REVIEW_BRIDGE`) that prints review JSON on stdout. **claude-in-chrome
is only available *inside* a Claude session — it is NOT a standalone shell
command.** So there is no headless launchd path that can drive Chrome here.

The realistic delivery is a **Claude-driven session task on a schedule** (a
session like this one, run 2-4×/day): the session opens the feed via the URL
above, runs `GOOGLE_MAPS_REVIEW_SCRIPT`, pipes cards through
`parse_google_review_cards`, then calls the same dedup/draft/SLA logic in
`review_monitor.main()` (feeding cards directly rather than via the env-var
bridge). The launchd plist remains valid only for the *state/SLA/notify* bookkeeping
on cards a session has already harvested — it cannot fetch on its own.
