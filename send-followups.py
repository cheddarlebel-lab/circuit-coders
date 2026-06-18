#!/usr/bin/env python3
"""Send in-thread follow-up bumps to clean-channel (Gmail) pitches that never got a reply.

Reads sent.jsonl + gmail-resend.jsonl, finds Gmail-channel sends, checks each thread
for replies (read token), sends a short bump as a threaded reply (send token).

Usage:
  python3 send-followups.py --dry-run   # list what would happen, no sends
  python3 send-followups.py             # send for real
"""
import json, sys, time, random, pathlib, datetime, base64, urllib.request, urllib.parse
from email.mime.text import MIMEText

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
SENT = LOG / "sent.jsonl"
FOLLOWUPS = LOG / "followups.jsonl"
PROGRESS = LOG / "send-progress.log"
ME = "cheddar.lebel@gmail.com"
DRY = "--dry-run" in sys.argv
MIN_AGE_DAYS = 4  # don't bump anything fresher than this

def log_progress(msg):
    line = f"[{datetime.datetime.now().isoformat(timespec='seconds')}] {msg}\n"
    with open(PROGRESS, "a") as f:
        f.write(line)
    print(line, end="", flush=True)

def refresh(token_path):
    d = json.load(open(token_path))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(d.get("token_uri", "https://oauth2.googleapis.com/token"), data=body)
    resp = json.load(urllib.request.urlopen(req))
    return resp["access_token"]

def api_get(token, path):
    req = urllib.request.Request(f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
                                 headers={"Authorization": f"Bearer {token}"})
    return json.load(urllib.request.urlopen(req))

def api_post(token, path, payload):
    req = urllib.request.Request(
        f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))

def header(msg_meta, name):
    for h in msg_meta.get("payload", {}).get("headers", []):
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""

def main():
    read_tok = refresh(HOME / ".gmail_read_token.json")
    send_tok = None if DRY else refresh(HOME / ".gmail_send_token.json")

    # Collect clean-channel sends, dedupe by email (prefer latest gmail send)
    already_bumped = set()
    if FOLLOWUPS.exists():
        for line in FOLLOWUPS.read_text().splitlines():
            if line.strip():
                already_bumped.add(json.loads(line).get("email", "").lower())

    targets = {}
    for line in SENT.read_text().splitlines():
        if not line.strip():
            continue
        d = json.loads(line)
        ch = d.get("channel", "")
        if ch == "gmail-api":
            gmail_id, sent_at = d.get("message_id"), d.get("sent_at", "")
        elif ch == "gmail-api-resend":
            gmail_id, sent_at = d.get("resend_message_id"), d.get("resent_at", "")
        else:
            continue
        if not gmail_id:
            continue
        targets[d["email"].lower()] = {
            "prospect": d.get("prospect", "?"), "email": d["email"],
            "gmail_id": gmail_id, "sent_at": sent_at,
        }

    now = datetime.datetime.now(datetime.timezone.utc)
    queue, skipped = [], []
    for email, t in sorted(targets.items()):
        if email in already_bumped:
            skipped.append((t, "already bumped"))
            continue
        try:
            age = (now - datetime.datetime.fromisoformat(t["sent_at"].replace("Z", "+00:00"))).days
        except ValueError:
            age = 99
        if age < MIN_AGE_DAYS:
            skipped.append((t, f"too fresh ({age}d)"))
            continue
        # Fetch original message -> thread + headers
        try:
            meta = api_get(read_tok, f"messages/{t['gmail_id']}?format=metadata"
                           "&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=To")
        except Exception as e:
            skipped.append((t, f"fetch failed: {e}"))
            continue
        thread_id = meta["threadId"]
        thread = api_get(read_tok, f"threads/{thread_id}?format=metadata&metadataHeaders=From")
        incoming = [m for m in thread.get("messages", [])
                    if ME not in header(m, "From").lower()]
        if incoming:
            skipped.append((t, f"HAS {len(incoming)} INCOMING MSG(S) — REVIEW, do not bump"))
            continue
        t.update({"thread_id": thread_id, "subject": header(meta, "Subject"),
                  "rfc_msgid": header(meta, "Message-ID"), "age_days": age})
        queue.append(t)

    log_progress(f"followups: {len(queue)} to bump, {len(skipped)} skipped {'(DRY RUN)' if DRY else ''}")
    for t, why in skipped:
        log_progress(f"  SKIP {t['prospect']} <{t['email']}>: {why}")

    def original_greeting(gmail_id):
        """First line of the original pitch body ('Kevin,' / 'Betsy,' ...), fallback 'Hey,'."""
        try:
            full = api_get(read_tok, f"messages/{gmail_id}?format=full")
            def walk(p):
                if p.get("mimeType") == "text/plain" and p.get("body", {}).get("data"):
                    return base64.urlsafe_b64decode(p["body"]["data"]).decode(errors="replace")
                for sub in p.get("parts", []) or []:
                    txt = walk(sub)
                    if txt:
                        return txt
                return ""
            text = walk(full.get("payload", {}))
            line = next((l.strip() for l in text.splitlines() if l.strip()), "")
            # sane greeting: short, ends with comma, 1-3 words
            if line.endswith(",") and 0 < len(line) <= 30 and len(line.split()) <= 3:
                return line
        except Exception:
            pass
        return "Hey,"

    for i, t in enumerate(queue, 1):
        greeting = original_greeting(t["gmail_id"])
        body = f"""{greeting}

Leo again — floating this back up in case it got buried.

The free mockup offer still stands: I take the issues I flagged below and turn them into a one-page redesign you can actually look at before spending a dime. No meeting, no card, no obligation — you reply, I build it, you decide.

If it's a no, one line back and I'll close the file. Otherwise I'll have it to you inside 3 days.

— Leo
Circuit Coders · circuitcoders.com"""
        subject = t["subject"] if t["subject"].lower().startswith("re:") else f"Re: {t['subject']}"
        if DRY:
            log_progress(f"  [DRY {i}/{len(queue)}] would bump {t['prospect']} <{t['email']}> "
                         f"(age {t['age_days']}d, thread {t['thread_id']})")
            continue
        mime = MIMEText(body, "plain", "utf-8")
        mime["To"] = t["email"]
        mime["From"] = f"Leo Lebel <{ME}>"
        mime["Subject"] = subject
        if t["rfc_msgid"]:
            mime["In-Reply-To"] = t["rfc_msgid"]
            mime["References"] = t["rfc_msgid"]
        raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()
        try:
            resp = api_post(send_tok, "messages/send", {"raw": raw, "threadId": t["thread_id"]})
            rec = {"type": "followup-1", "prospect": t["prospect"], "email": t["email"],
                   "thread_id": t["thread_id"], "orig_gmail_id": t["gmail_id"],
                   "bump_gmail_id": resp.get("id"), "sender": ME,
                   "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            with open(FOLLOWUPS, "a") as f:
                f.write(json.dumps(rec) + "\n")
            log_progress(f"  [{i}/{len(queue)}] ✓ bumped {t['prospect']} <{t['email']}>")
        except Exception as e:
            log_progress(f"  [{i}/{len(queue)}] ✗ FAILED {t['prospect']} <{t['email']}>: {e}")
        if i < len(queue):
            time.sleep(random.uniform(20, 40))

if __name__ == "__main__":
    main()
