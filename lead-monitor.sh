#!/bin/bash
# Circuit Coders Lead Monitor
# Checks Turso DB for new leads every 5 minutes.
# Sends Telegram notification + creates fulfillment plan for each new lead.

# Secrets sourced from .secrets/monitor.env (gitignored) — never hardcode.
SECRETS_FILE="$HOME/clawd/circuit-coders/.secrets/monitor.env"
if [ -f "$SECRETS_FILE" ]; then
    # shellcheck disable=SC1090
    source "$SECRETS_FILE"
fi
STATE_FILE="$HOME/clawd/circuit-coders/.last_lead_id"

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
    echo "0" > "$STATE_FILE"
fi

python3 "$HOME/clawd/circuit-coders/lead-monitor.py"
