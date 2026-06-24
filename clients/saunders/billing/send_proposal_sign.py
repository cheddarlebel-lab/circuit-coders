#!/usr/bin/env python3
"""Re-send the Saunders v7 proposal asking Jared to sign + photo it back.
Same Gmail API auth as send_proposal.py (cheddar.lebel@gmail.com, gmail.send).
Run: python3 send_proposal_sign.py [--dry-run]
"""
import base64, datetime, json, pathlib, sys, urllib.request, urllib.parse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
ME = "cheddar.lebel@gmail.com"
TO = "jareds@toyotaofvero.com"
SUBJECT = "Toyota & Kia of Vero Beach — proposal to sign"
PDF = HOME / "clawd/circuit-coders/pitches/Toyota-Kia-Vero-Beach-Brand-Management-Proposal-v7.pdf"
DRY = "--dry-run" in sys.argv

BODY = """Hi Jared,

Attaching the proposal again so it's all in one place — flat $2,500/month, both rooftops, month-to-month, no upfront cost.

To keep it simple, no e-sign needed: if the terms look good, just sign the last page and send me back a quick photo of it.

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
           "sender": ME, "source": "saunders-proposal-sign", "attachment": PDF.name}
    with open(LOG / "sent.jsonl", "a") as f:
        f.write(json.dumps(rec) + "\n")
    print(f"✓ SENT to {TO} (msg {resp.get('id')}) with {PDF.name} attached")


if __name__ == "__main__":
    main()
