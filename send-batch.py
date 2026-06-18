#!/usr/bin/env python3
"""Send a batch of cold pitches via Gmail API. Usage: send-batch.py <batch.json> [--dry-run]

Batch file: JSON array of {prospect, email, vertical, website, subject, body}.
Logs each send to outreach-log/sent.jsonl (channel gmail-api) so dedupe +
gmail-reply-monitor pick them up automatically. Throttled 25-45s.
"""
import json, sys, time, random, pathlib, datetime, base64, urllib.request, urllib.parse
from email.mime.text import MIMEText

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
ME = "cheddar.lebel@gmail.com"
DRY = "--dry-run" in sys.argv

def refresh():
    d = json.load(open(HOME / ".gmail_send_token.json"))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))["access_token"]

def main():
    batch = json.loads(pathlib.Path(sys.argv[1]).read_text())
    sent_emails = set()
    for line in (LOG / "sent.jsonl").read_text().splitlines():
        if line.strip():
            sent_emails.add(json.loads(line).get("email", "").lower())
    tok = None if DRY else refresh()
    n = 0
    for item in batch:
        if item["email"].lower() in sent_emails:
            print(f"SKIP {item['prospect']}: already in sent.jsonl")
            continue
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
                   "sender": ME, "source": "lead-miner"}
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
