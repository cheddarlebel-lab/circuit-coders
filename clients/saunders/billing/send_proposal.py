#!/usr/bin/env python3
"""Send the Saunders brand-management proposal to Jared via the Gmail API
(same auth as send-batch.py: ~/.gmail_send_token.json, gmail.send scope, as
cheddar.lebel@gmail.com) WITH the proposal PDF attached as a real attachment.

Logs to outreach-log/sent.jsonl so reply-monitor/dedupe pick it up.
Run: python3 send_proposal.py [--dry-run]
"""
import base64, datetime, json, pathlib, sys, urllib.request, urllib.parse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
ME = "cheddar.lebel@gmail.com"
TO = "jareds@toyotaofvero.com"
SUBJECT = "Toyota & Kia of Vero Beach — brand management proposal (+ heads up on the signing doc)"
PDF = HOME / "clawd/circuit-coders/pitches/Toyota-Kia-Vero-Beach-Brand-Management-Proposal.pdf"
DRY = "--dry-run" in sys.argv

BODY = """Hi Jared,

The brand-management proposal for both rooftops is attached — the $2,500 get-well sprint plus $2,950/mo across Toyota and Kia, month-to-month. It lays out what we fix first (the homepage still reading "Visit DealerOn Toyota," the BBB rating, the scattered phone numbers and listings) and how the ongoing management protects the ad spend you're already running.

One heads up: the document I sent over for your signature comes through under Verimatch, so it most likely landed in your spam/junk folder — e-sign emails usually do. If it's not in your inbox, check there and it should be near the top. Just say the word and I'll re-send.

Thanks Jared,
Leo
"""


def refresh():
    d = json.load(open(HOME / ".gmail_send_token.json"))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))["access_token"]


def main():
    if not PDF.exists():
        sys.exit(f"PDF not found: {PDF}")
    msg = MIMEMultipart()
    msg["To"] = TO
    msg["From"] = f"Leo Lebel <{ME}>"
    msg["Subject"] = SUBJECT
    msg.attach(MIMEText(BODY, "plain", "utf-8"))
    part = MIMEApplication(PDF.read_bytes(), _subtype="pdf")
    part.add_header("Content-Disposition", "attachment", filename=PDF.name)
    msg.attach(part)

    if DRY:
        print(f"[DRY] would send to {TO} from {ME} with {PDF.name} ({PDF.stat().st_size//1024} KB)")
        return
    tok = refresh()
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    resp = json.load(urllib.request.urlopen(urllib.request.Request(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        data=json.dumps({"raw": raw}).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})))
    rec = {"prospect": "Toyota & Kia of Vero Beach (Jared Saunders)", "email": TO,
           "subject": SUBJECT, "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
           "message_id": resp.get("id"), "status": "sent", "channel": "gmail-api",
           "sender": ME, "source": "saunders-proposal", "attachment": PDF.name}
    with open(LOG / "sent.jsonl", "a") as f:
        f.write(json.dumps(rec) + "\n")
    print(f"✓ SENT to {TO} (msg {resp.get('id')}) with {PDF.name} attached")


if __name__ == "__main__":
    main()
