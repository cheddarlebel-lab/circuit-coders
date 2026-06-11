#!/bin/bash
# Circuit Coders Lead Monitor
# Checks Turso DB for new leads every 5 minutes.
# Sends Telegram notification + creates fulfillment plan for each new lead.

TURSO_URL="https://circuit-coders-cheddar.aws-us-west-2.turso.io"
TURSO_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzQzMTQ1NDIsImlkIjoiMDE5ZDFkNjMtMzkwMS03OGY0LWFjMDAtZDBiY2IyYzczMWU1IiwicmlkIjoiMWUyY2Q0M2UtYzNkYi00NmNlLWFkNDgtZmU4MTk3MWNhY2U5In0.7Ns6hzwtKLID-gg71aGnwn-eUizwAr9U-beu31sJyJmuIuWxcyzyqlzFB3l45RkKVgqI1CI6H7v5P6In91sWDw"
TELEGRAM_TOKEN="8219388922:AAH3eGhbcCJPd_oSBHYPPROddcFWHnjVQXg"
TELEGRAM_CHAT_ID=""  # Will be set by python script
STATE_FILE="$HOME/clawd/circuit-coders/.last_lead_id"

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
    echo "0" > "$STATE_FILE"
fi

python3 "$HOME/clawd/circuit-coders/lead-monitor.py"
