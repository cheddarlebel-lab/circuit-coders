#!/usr/bin/env bash
# Circuit Coders — daily blog publish pipeline
# Generates the next queued post, commits it, and ships to production.
# Intended to run once per day (launchctl / cron).

set -euo pipefail

REPO="$HOME/clawd/circuit-coders"
LOG="$HOME/memory/log.md"
cd "$REPO"

ts_log() {
  printf '[%s] [cron] %s\n' "$(date '+%F %H:%M')" "$1" >> "$LOG"
}

ts_log "publish-daily: starting"

# 1. Generate next queued post. Captures the JSON summary for commit message.
SUMMARY=$(python3 scripts/generate-blog-post.py 2>&1 | tail -1)
echo "$SUMMARY"

STATUS=$(printf '%s' "$SUMMARY" | python3 -c 'import json,sys;print(json.loads(sys.stdin.read()).get("status",""))' 2>/dev/null || echo "")
SLUG=$(printf '%s' "$SUMMARY" | python3 -c 'import json,sys;print(json.loads(sys.stdin.read()).get("slug",""))' 2>/dev/null || echo "")

if [ "$STATUS" != "published" ]; then
  ts_log "publish-daily: nothing to publish ($STATUS) — exiting"
  exit 0
fi

# 2. Commit (if this repo is under git). Vercel CLI deploy follows regardless.
if [ -d .git ]; then
  git add src/lib/blog-posts.ts 2>/dev/null || true
  git add "$HOME/memory/seo-assets/keyword-queue.md" 2>/dev/null || true
  git commit -m "blog: publish $SLUG" --no-verify 2>/dev/null || true
fi

# 3. Deploy to production.
DEPLOY_OUT=$(vercel --prod --yes 2>&1)
DEPLOY_URL=$(printf '%s' "$DEPLOY_OUT" | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)

ts_log "publish-daily: shipped $SLUG → https://circuitcoders.com/blog/$SLUG (vercel: $DEPLOY_URL)"

# 4. Ping Google's ping endpoint to hint the sitemap changed.
curl -s "https://www.google.com/ping?sitemap=https://circuitcoders.com/sitemap.xml" > /dev/null || true

echo "shipped: https://circuitcoders.com/blog/$SLUG"
