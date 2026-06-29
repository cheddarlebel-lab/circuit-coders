#!/bin/zsh
# One-shot reminder: Saunders ($2,500/mo) trial converts 2026-07-19.
# Re-checks Stripe live, notifies Leo, logs, then self-removes.
RKFILE="$HOME/clawd/circuit-coders/.secrets/stripe_live_restricted.key"
RK=$(tr -d ' \n\r' < "$RKFILE")
TMP=$(mktemp)
curl -s "https://api.stripe.com/v1/subscriptions?customer=cus_UkgWe03En22UPP&status=all&limit=5" -u "$RK:" > "$TMP"
SUMMARY=$(python3 -c "
import json,datetime
d=json.load(open('$TMP'))
out=[]
for s in d.get('data',[]):
    it=s['items']['data'][0]; pr=it['price']
    amt=(pr.get('unit_amount') or 0)/100
    te=s.get('trial_end')
    out.append('%s \$%.0f/%s trial_end %s'%(s['status'],amt,pr['recurring']['interval'],datetime.datetime.utcfromtimestamp(te).strftime('%Y-%m-%d') if te else 'none'))
print(' | '.join(out) or 'no sub found')
")
MSG="Saunders \$2500/mo trial converts SUN 7/19. Stripe now: $SUMMARY. Billing correct (flat \$2500/mo). ACTION: confirm access call done + work delivered + progress report sent BEFORE it bills, or it churns."
osascript -e "display notification \"$MSG\" with title \"Saunders \$2500/mo bills 7/19 — confirm delivery\" sound name \"Glass\""
echo "[$(date '+%Y-%m-%d %H:%M') ] [reminder] $MSG" >> "$HOME/memory/log.md"
# self-remove (one-shot)
launchctl unload "$HOME/Library/LaunchAgents/com.circuitcoders.saunders-trial-reminder.plist" 2>/dev/null
rm -f "$HOME/Library/LaunchAgents/com.circuitcoders.saunders-trial-reminder.plist"
rm -f "$TMP"
