#!/usr/bin/env python3
"""One-shot: in-thread bumps for the June 9-10 GC batch (sent via Gmail web, not API).

Thread list hardcoded from sent-folder recovery 2026-06-11. Skips threads with any
incoming message (reply or bounce). Logs to followups.jsonl as type followup-1-gc.
"""
import json, time, random, pathlib, datetime, base64, urllib.request, urllib.parse, sys
from email.mime.text import MIMEText

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
FOLLOWUPS = LOG / "followups.jsonl"
PROGRESS = LOG / "send-progress.log"
ME = "cheddar.lebel@gmail.com"
DRY = "--dry-run" in sys.argv

# (prospect, email, orig_gmail_msg_id, thread_id, greeting)
TARGETS = [
    ("Block Contracting (Chase Johnson)", "chase@blockcontracting.com", "19eae498998180f0", "19eae487fea27717", "Chase,"),
    ("Sandoval Roofing (Raymond)", "rmndsandoval@gmail.com", "19eae4d166417212", "19eae4ce943d9355", "Raymond,"),
    ("Cordada Construction", "fcordada@yahoo.com", "19eae4eaa1b2a473", "19eae4e7a71911f2", "Hey,"),
    ("Elias Amparano Remodeling", "e.a.r.c.8691@gmail.com", "19eae4ff11a1e5dc", "19eae4efc3c76089", "Elias,"),
    ("TWM Roofing (Tom Marshall)", "Info@twmroofing.com", "19eb2237c8d5bdf2", "19eb2233e3fee9f3", "Tom,"),
    ("Development Dream Home (Nezi)", "developmentdreamhome@gmail.com", "19eb22556867a20e", "19eb224fac872474", "Nezi,"),
    ("Ambar Builders (Alex)", "info@ambarbuilders.com", "19eb22802cbc41de", "19eb22797a1dac75", "Alex,"),
    ("Caliber Construction & Remodeling", "info@caliberconstructionandremodeling.com", "19eb229964d0d493", "19eb22968b465941", "Hey,"),
    ("Eco Home Builders", "info@ecohomebuildersinc.com", "19eb22b0f2441bbc", "19eb22ade63e69b8", "Hey,"),
    ("Summer Roofing (info@)", "info@summerroofinginc.com", "19eb2339d5f6a01d", "19eb2339b50eb0dd", "Hey,"),
]

def log_progress(msg):
    line = f"[{datetime.datetime.now().isoformat(timespec='seconds')}] {msg}\n"
    with open(PROGRESS, "a") as f:
        f.write(line)
    print(line, end="", flush=True)

def refresh(token_path):
    d = json.load(open(token_path))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))["access_token"]

def api_get(token, path):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
        headers={"Authorization": f"Bearer {token}"})))

def api_post(token, path, payload):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})))

def header(m, name):
    return next((h["value"] for h in m.get("payload", {}).get("headers", [])
                 if h["name"].lower() == name.lower()), "")

def main():
    read_tok = refresh(HOME / ".gmail_read_token.json")
    send_tok = None if DRY else refresh(HOME / ".gmail_send_token.json")

    already = set()
    if FOLLOWUPS.exists():
        for line in FOLLOWUPS.read_text().splitlines():
            if line.strip():
                already.add(json.loads(line).get("email", "").lower())

    n = 0
    for prospect, email, mid, tid, greeting in TARGETS:
        if email.lower() in already:
            log_progress(f"  SKIP {prospect}: already bumped")
            continue
        th = api_get(read_tok, f"threads/{tid}?format=metadata&metadataHeaders=From")
        incoming = [m for m in th.get("messages", []) if ME not in header(m, "From").lower()]
        if incoming:
            frm = header(incoming[0], "From")
            log_progress(f"  SKIP {prospect}: {len(incoming)} incoming msg(s), first from {frm} — REVIEW")
            continue
        meta = api_get(read_tok, f"messages/{mid}?format=metadata"
                       "&metadataHeaders=Subject&metadataHeaders=Message-ID")
        subject = header(meta, "Subject")
        rfc_msgid = header(meta, "Message-ID")
        body = f"""{greeting}

Leo again — quick nudge, I know it's only been a couple of days.

The free mockup offer is real: I take what I flagged below and turn it into a rebuilt homepage you can actually look at before deciding anything. No call, no card — reply "go" and it's in your inbox within 3 days.

If it's not for you, one line back and I won't follow up again.

— Leo
Circuit Coders · circuitcoders.com"""
        if DRY:
            log_progress(f"  [DRY] would bump {prospect} <{email}> (thread {tid})")
            continue
        mime = MIMEText(body, "plain", "utf-8")
        mime["To"] = email
        mime["From"] = f"Leo Lebel <{ME}>"
        mime["Subject"] = subject if subject.lower().startswith("re:") else f"Re: {subject}"
        if rfc_msgid:
            mime["In-Reply-To"] = rfc_msgid
            mime["References"] = rfc_msgid
        raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()
        try:
            resp = api_post(send_tok, "messages/send", {"raw": raw, "threadId": tid})
            with open(FOLLOWUPS, "a") as f:
                f.write(json.dumps({"type": "followup-1-gc", "prospect": prospect, "email": email,
                                    "thread_id": tid, "orig_gmail_id": mid,
                                    "bump_gmail_id": resp.get("id"), "sender": ME,
                                    "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}) + "\n")
            n += 1
            log_progress(f"  ✓ bumped {prospect} <{email}>")
        except Exception as e:
            log_progress(f"  ✗ FAILED {prospect} <{email}>: {e}")
        time.sleep(random.uniform(20, 40))
    log_progress(f"gc-bumps done: {n} sent")

if __name__ == "__main__":
    main()
