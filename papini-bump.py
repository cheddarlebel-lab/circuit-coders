#!/usr/bin/env python3
"""One-shot 3-day bump for Papini's Garage. Only sends if Richard hasn't replied.
Checks the original thread for incoming messages; if none, sends a tailored
in-thread follow-up. Logs to outreach-log/followups.jsonl. Idempotent.
"""
import json, pathlib, datetime, base64, urllib.request, urllib.parse
from email.mime.text import MIMEText

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
SENT = LOG / "sent.jsonl"
FOLLOWUPS = LOG / "followups.jsonl"
ME = "cheddar.lebel@gmail.com"
TARGET_EMAIL = "papinisgarage@outlook.com"
ORIG_GMAIL_ID = "19ef0293ffa3e6f2"

def refresh(token_path):
    d = json.load(open(token_path))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(d.get("token_uri", "https://oauth2.googleapis.com/token"), data=body)
    return json.load(urllib.request.urlopen(req))["access_token"]

def api_get(token, path):
    req = urllib.request.Request(f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
                                 headers={"Authorization": f"Bearer {token}"})
    return json.load(urllib.request.urlopen(req))

def api_post(token, path, payload):
    req = urllib.request.Request(f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
                                 data=json.dumps(payload).encode(),
                                 headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))

def header(msg, name):
    for h in msg.get("payload", {}).get("headers", []):
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""

def main():
    # Idempotency: skip if already bumped
    if FOLLOWUPS.exists():
        for line in FOLLOWUPS.read_text().splitlines():
            if line.strip() and json.loads(line).get("email", "").lower() == TARGET_EMAIL:
                print("already bumped — exit")
                return

    tok = refresh(HOME / ".gmail_send_token.json")
    meta = api_get(tok, f"messages/{ORIG_GMAIL_ID}?format=metadata"
                   "&metadataHeaders=Subject&metadataHeaders=Message-ID")
    thread_id = meta["threadId"]
    rfc_msgid = header(meta, "Message-ID")
    subject = header(meta, "Subject")

    thread = api_get(tok, f"threads/{thread_id}?format=metadata&metadataHeaders=From")
    incoming = [m for m in thread.get("messages", []) if ME not in header(m, "From").lower()]
    if incoming:
        print(f"Richard replied ({len(incoming)} incoming) — DO NOT bump. Review manually.")
        return

    body = """Richard,

Leo again — floating this back up in case it got buried.

No pitch here either. If even one of those gaps is worth a quick look — especially catching those weekend calls before they go to another shop — I'm happy to mock up exactly how it'd work for Papini's, free, before you spend a dime.

If it's a no, one line back and I'll leave you be.

Best,
Leo Lebel
cheddar.lebel@gmail.com"""

    subj = subject if subject.lower().startswith("re:") else f"Re: {subject}"
    mime = MIMEText(body, "plain", "utf-8")
    mime["To"] = TARGET_EMAIL
    mime["From"] = f"Leo Lebel <{ME}>"
    mime["Subject"] = subj
    if rfc_msgid:
        mime["In-Reply-To"] = rfc_msgid
        mime["References"] = rfc_msgid
    raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()
    resp = api_post(tok, "messages/send", {"raw": raw, "threadId": thread_id})
    rec = {"type": "followup-1", "prospect": "Papini's Garage LLC", "email": TARGET_EMAIL,
           "thread_id": thread_id, "orig_gmail_id": ORIG_GMAIL_ID,
           "bump_gmail_id": resp.get("id"), "sender": ME,
           "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    with open(FOLLOWUPS, "a") as f:
        f.write(json.dumps(rec) + "\n")
    print(f"bumped Papini's Garage <{TARGET_EMAIL}>")

if __name__ == "__main__":
    main()
