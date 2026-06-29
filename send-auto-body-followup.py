#!/usr/bin/env python3
"""Send the auto-shop AI-front-desk package follow-up to a curated batch.

Unlike send-batch.py this does NOT skip emails already in sent.jsonl — these leads
were intentionally contacted once (audit pitch, 2026-06-22); this is the 2nd touch.
Sends as a fresh email (new subject) via Gmail API, throttled, logs to sent.jsonl.

Usage:
  python3 send-auto-body-followup.py outreach-log/auto-body-followup-2026-06-24.json --dry-run
  python3 send-auto-body-followup.py outreach-log/auto-body-followup-2026-06-24.json
"""
import json, sys, time, random, pathlib, datetime, base64, urllib.request, urllib.parse
from email.mime.text import MIMEText

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
ME = "cheddar.lebel@gmail.com"
DRY = "--dry-run" in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith("--")]
BATCH = args[0] if args else "outreach-log/auto-body-followup-2026-06-24.json"

def refresh():
    d = json.load(open(HOME / ".gmail_send_token.json"))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))["access_token"]

def main():
    batch = json.loads(pathlib.Path(BATCH).read_text())
    tok = None if DRY else refresh()
    n = 0
    for item in batch:
        if DRY:
            print(f"[DRY] would send {item['prospect']} <{item['email']}>: {item['subject']}")
            continue
        mime = MIMEText(item["body"], "plain", "utf-8")
        mime["To"] = item["email"]
        mime["From"] = f"Leo Lebel <{ME}>"
        mime["Subject"] = item["subject"]
        raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()
        try:
            resp = json.load(urllib.request.urlopen(urllib.request.Request(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                data=json.dumps({"raw": raw}).encode(),
                headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})))
            rec = {"prospect": item["prospect"], "email": item["email"], "website": item.get("website"),
                   "vertical": item.get("vertical"), "subject": item["subject"],
                   "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   "message_id": resp.get("id"), "status": "sent", "channel": "gmail-api",
                   "sender": ME, "source": "auto-shop-package-followup"}
            with open(LOG / "sent.jsonl", "a") as f:
                f.write(json.dumps(rec) + "\n")
            n += 1
            print(f"✓ sent {item['prospect']} <{item['email']}>")
        except Exception as e:
            print(f"✗ FAILED {item['prospect']}: {e}")
        time.sleep(random.uniform(25, 45))
    print(f"done: {n} sent")

if __name__ == "__main__":
    main()
