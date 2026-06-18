# Saunders Brand-Management Machine
The always-on engine behind the $2,950/mo retainer. Built pre-signature so the 14-day
sprint is "flip switches + deliver," not "build + deliver." Runs **dry and error-free
today** (no client access) — every fetch is a clearly-marked seam that returns empty
until access lands at kickoff.

## Components
| Script | Promise it keeps | Cadence |
|---|---|---|
| `review_monitor.py` | 24h review-response SLA, all platforms, both stores | 3x/day (launchd) |
| `queue_tracker.py` | "Nothing silently disappears" — every 3rd-party filing tracked | weekly check + on-demand |
| `rank_tracker.py` | Search-visibility trend in the monthly report | weekly (launchd) |
| `monthly_report.py` | One branded PDF per rooftop, monthly | day 1 of month |
| `lib.py` | shared config/notify/state helpers | — |
| `config/stores.json` | single source of truth (canonical NAP + access flags) | edit at kickoff |

The **review-gen kit** (QR cards + staff one-pager) lives in `../review-gen/`.

## Activate at kickoff (Stage B/C)
1. Fill every `<FILL ...>` and set the `*_access`/`claimed`/`account` flags to `true`
   in `config/stores.json` as access is collected on the call.
2. Wire the two fetch seams to the Chrome scrape:
   - `review_monitor.fetch_reviews()` — parse review cards per platform
   - `rank_tracker.check_keyword()` — read map-pack + organic position
3. Install schedules:
   ```sh
   cp launchd/*.plist ~/Library/LaunchAgents/
   launchctl load -w ~/Library/LaunchAgents/com.circuitcoders.saunders.review-monitor.plist
   launchctl load -w ~/Library/LaunchAgents/com.circuitcoders.saunders.weekly.plist
   ```
4. Seed queue (`data/thirdparty_queue.json`) is pre-loaded with all 18 Stage-A items —
   on Day 1, run `queue_tracker.py update <id> --status filed` as each gets filed so the
   PENDING_KICKOFF/TBD dates flip to real clocks.

## Daily/ongoing ops
- New review → notification → review `data/response_queue.json` → approve or let a
  template-safe 4-5★ auto-post after 24h (only if Leo enables that per-store rule).
- `queue_tracker.py report` → drops the markdown table straight into the monthly report.
- `monthly_report.py --pdf` → per-store markdown; render with the proposal's WeasyPrint
  template + brand colors (Toyota #EB0A1E / Kia #BB162B).

## Hard rules carried from the engagement
- Never imply "unlicensed" anywhere public (BBB flag = records gap, dealer holds MV4029).
- No paid tools/APIs without Leo's explicit OK.
- Everything created under DEALERSHIP ownership.
- Negative-review drafts always route through a human-fact step before posting.
