#!/bin/bash
# Circuit Coders — Daily Lead Release
# Every day at 9 AM, promotes 5 pins from status='queued' to status='prospect'
# and pings Leo on Telegram. When queue drops below 10, fires a refill alert.

set -u

LOG=/tmp/cc-daily-leads.log
PROJECT_DIR="$HOME/clawd/circuit-coders"
BASE_URL="https://www.circuitcoders.com"
TELEGRAM_TOKEN="8219388922:AAH3eGhbcCJPd_oSBHYPPROddcFWHnjVQXg"
TELEGRAM_CHAT_ID="7086525719"

timestamp() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(timestamp)] $*" | tee -a "$LOG"; }

TURSO_URL="https://circuit-coders-cheddar.aws-us-west-2.turso.io"
TURSO_TOKEN=$(grep '^TURSO_AUTH_TOKEN=' "$PROJECT_DIR/.env.production" | sed 's/^TURSO_AUTH_TOKEN=//; s/^"//; s/"$//')

log "=== Daily lead release ==="

python3 - <<PY
import json, urllib.request, sys

TURSO_URL = "$TURSO_URL"
TURSO_TOKEN = "$TURSO_TOKEN"
TG_TOKEN = "$TELEGRAM_TOKEN"
TG_CHAT = "$TELEGRAM_CHAT_ID"
BASE_URL = "$BASE_URL"

def turso(sql, args=None):
    stmt = {"sql": sql}
    if args is not None:
        stmt["args"] = args
    body = json.dumps({"requests": [{"type": "execute", "stmt": stmt}, {"type": "close"}]}).encode()
    req = urllib.request.Request(f"{TURSO_URL}/v2/pipeline", data=body,
        headers={"Authorization": f"Bearer {TURSO_TOKEN}", "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req).read())
    result = r.get("results", [{}])[0]
    if result.get("type") == "error":
        raise RuntimeError(result.get("error", {}).get("message", "unknown error"))
    response = result.get("response", {}).get("result", {})
    cols = [c["name"] for c in response.get("cols", [])]
    rows = []
    for row in response.get("rows", []):
        rows.append({cols[i]: cell.get("value") for i, cell in enumerate(row)})
    return rows

def send_tg(text, markdown=True):
    payload = {"chat_id": TG_CHAT, "text": text}
    if markdown:
        payload["parse_mode"] = "Markdown"
    body = json.dumps(payload).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
        data=body, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"TG failed: {e}", file=sys.stderr)

# Pick 5 oldest queued pins
queued = turso(
    "SELECT id, label, pin_type, notes, outreach_script, outreach_channel FROM target_pins WHERE status = 'queued' ORDER BY id ASC LIMIT 5"
)

if not queued:
    send_tg("⚠️ *Circuit Coders daily leads*: queue is empty. Tell Claude 'refill the lead queue' to add more.", markdown=True)
    print("Queue empty — no releases")
    sys.exit(0)

# Flip them to 'prospect'
for p in queued:
    turso("UPDATE target_pins SET status = 'prospect' WHERE id = ?",
          args=[{"type": "integer", "value": str(p["id"])}])
    print(f"Released pin #{p['id']} — {p['label']}")

# How many left in queue?
remaining = turso("SELECT COUNT(*) as n FROM target_pins WHERE status = 'queued'")
n_left = int(remaining[0]["n"])

# Build Telegram message
lines = ["🎯 *5 new leads released on Circuit Coders:*\n"]
for p in queued:
    pt = (p.get("pin_type") or "").replace("_", " ")
    notes = p.get("notes") or ""
    handle = ""
    for seg in notes.split("|"):
        seg = seg.strip()
        if seg.startswith("IG:") or seg.startswith("FB:"):
            handle = seg
            break
    script = p.get("outreach_script") or "(no script)"
    channel = p.get("outreach_channel") or "—"
    lines.append(f"*{p['label']}* ({pt})")
    if handle: lines.append(f"  {handle}")
    lines.append(f"  📨 {channel}")
    lines.append(f"  💬 _{script[:200]}_\n")

lines.append(f"Queue remaining: *{n_left}* leads")
if n_left < 10:
    lines.append("⚠️ Queue low — tell Claude 'refill lead queue' soon.")
lines.append(f"\nView: {BASE_URL}/admin")

send_tg("\n".join(lines))
print(f"Telegram sent. Queue left: {n_left}")
PY

log "=== Done ==="
