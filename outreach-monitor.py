#!/usr/bin/env python3
"""
Circuit Coders outreach response monitor.

Every run:
1. Pulls unread INBOX messages from admin@circuitcoders.com via IONOS IMAP.
2. For each reply, matches sender against outreach-log/sent.jsonl to find which prospect.
3. Classifies intent (interested / not-interested / question / other).
4. If interested → writes to ~/clawd/circuit-coders/outreach-log/replies.jsonl, updates
   ~/SecondBrain/circuit-coders/outreach/<Prospect>.md, and pings Leo via Telegram.
5. Marks message read.

Run hourly via launchd.
"""
import imaplib, email, json, pathlib, re, datetime, urllib.request, sys
from email.header import decode_header

USER = "admin@circuitcoders.com"
PW = "Wh@tismyPW38"
IMAP_HOST = "imap.ionos.com"
IMAP_PORT = 993

TG_TOKEN = "8219388922:AAH3eGhbcCJPd_oSBHYPPROddcFWHnjVQXg"
TG_CHAT = "7086525719"

HOME = pathlib.Path.home()
LOGDIR = HOME / "clawd/circuit-coders/outreach-log"
SENT_LOG = LOGDIR / "sent.jsonl"
REPLIES_LOG = LOGDIR / "replies.jsonl"
OBSIDIAN_DIR = HOME / "SecondBrain/circuit-coders/outreach"

INTEREST_PATTERNS = [
    r"\bsend\s+(me\s+)?(the\s+)?(mockup|mock|sample|preview|draft)",
    r"\byes\b.*\b(please|mockup|send|interested)",
    r"\binterested\b",
    r"\b(let'?s|let me)\s+(see|talk|chat)",
    r"\bcall me\b",
    r"\b(go ahead|sounds good|sure thing|sure,? send)",
    r"\b(pricing|quote|how much|price list)",
    r"\b(book a (call|meeting|time))",
]
DECLINE_PATTERNS = [
    r"\b(not interested|no thanks?|no thank you|stop emailing|unsubscribe|remove me)",
    r"\b(we'?re good|all set|have a site|happy with)",
]

def classify(body: str) -> str:
    b = body.lower()
    for p in INTEREST_PATTERNS:
        if re.search(p, b):
            return "interested"
    for p in DECLINE_PATTERNS:
        if re.search(p, b):
            return "declined"
    return "unclear"

def load_sent_index():
    """Map lowercased 'to' email → prospect record."""
    idx = {}
    if SENT_LOG.exists():
        for line in SENT_LOG.read_text().splitlines():
            try:
                r = json.loads(line)
                idx[r["to"].lower()] = r
            except Exception:
                continue
    return idx

def header_str(raw):
    if raw is None: return ""
    parts = decode_header(raw)
    out = ""
    for text, enc in parts:
        if isinstance(text, bytes):
            out += text.decode(enc or "utf-8", errors="replace")
        else:
            out += text
    return out

def get_body(msg) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = str(part.get("Content-Disposition", ""))
            if ctype == "text/plain" and "attachment" not in disp:
                try:
                    return part.get_payload(decode=True).decode(
                        part.get_content_charset() or "utf-8", errors="replace")
                except Exception:
                    continue
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                try:
                    html = part.get_payload(decode=True).decode(
                        part.get_content_charset() or "utf-8", errors="replace")
                    return re.sub(r"<[^>]+>", " ", html)
                except Exception:
                    continue
    else:
        try:
            return msg.get_payload(decode=True).decode(
                msg.get_content_charset() or "utf-8", errors="replace")
        except Exception:
            return ""
    return ""

def send_tg(text, markdown=True):
    payload = {"chat_id": TG_CHAT, "text": text}
    if markdown: payload["parse_mode"] = "Markdown"
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
        data=body, headers={"Content-Type": "application/json"})
    try: urllib.request.urlopen(req, timeout=10)
    except Exception as e: print(f"TG failed: {e}", file=sys.stderr)

def update_obsidian(prospect: str, sender: str, intent: str, body: str):
    safe = re.sub(r'[<>:"/\\|?*]', "", prospect).strip() or "unknown"
    path = OBSIDIAN_DIR / f"{safe}.md"
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    snippet = body.strip().replace("\r", "")[:800]
    append = f"""

### {ts} — Reply received ({intent})

From: {sender}

> {snippet.replace(chr(10), chr(10) + '> ')}

"""
    if path.exists():
        content = path.read_text()
        # Flip status checkbox
        content = content.replace("- [ ] Reply received", "- [x] Reply received")
        if intent == "interested":
            content = content.replace("- [ ] Mockup requested", "- [x] Mockup requested")
        if "status: contacted" in content:
            new_status = "replied-interested" if intent == "interested" else f"replied-{intent}"
            content = re.sub(r"^status:.*$", f"status: {new_status}", content, count=1, flags=re.M)
        path.write_text(content + append)
    else:
        OBSIDIAN_DIR.mkdir(parents=True, exist_ok=True)
        path.write_text(f"""---
prospect: {prospect}
status: replied-{intent}
tags: [circuit-coders, outreach]
---

# {prospect}

Reply received from {sender} before initial file existed.
{append}
""")

def main():
    sent_idx = load_sent_index()
    if not sent_idx:
        print("No prior outreach logged — nothing to match against.")
        return

    LOGDIR.mkdir(parents=True, exist_ok=True)

    m = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    m.login(USER, PW)
    m.select("INBOX")

    typ, data = m.search(None, "UNSEEN")
    if typ != "OK" or not data or not data[0]:
        print("No unread messages.")
        m.logout()
        return

    ids = data[0].split()
    print(f"{len(ids)} unread messages.")

    processed = 0
    for uid in ids:
        typ, msg_data = m.fetch(uid, "(RFC822)")
        if typ != "OK":
            continue
        msg = email.message_from_bytes(msg_data[0][1])
        from_raw = header_str(msg.get("From"))
        subject = header_str(msg.get("Subject"))
        # Extract bare email
        match = re.search(r"[\w.+-]+@[\w.-]+", from_raw or "")
        sender_email = match.group(0).lower() if match else ""

        if sender_email not in sent_idx:
            print(f"Skip (not a prospect): {from_raw} | {subject}")
            continue  # leave unread so Leo sees it

        prospect_rec = sent_idx[sender_email]
        prospect_name = prospect_rec.get("prospect", sender_email)
        body = get_body(msg)
        intent = classify(body)

        reply_rec = {
            "ts": datetime.datetime.now().isoformat(timespec="seconds"),
            "from": from_raw,
            "sender_email": sender_email,
            "prospect": prospect_name,
            "subject": subject,
            "intent": intent,
            "body": body[:4000],
        }
        with REPLIES_LOG.open("a") as f:
            f.write(json.dumps(reply_rec) + "\n")

        update_obsidian(prospect_name, from_raw, intent, body)

        icon = {"interested": "🔥", "declined": "❌", "unclear": "❓"}.get(intent, "📨")
        snippet = body.strip().replace("\n", " ")[:200]
        msg_txt = f"{icon} *Reply from {prospect_name}* ({intent})\n\n_{snippet}_\n\nObsidian: `circuit-coders/outreach/{prospect_name}.md`"
        if intent == "interested":
            msg_txt += "\n\n⚡ I'll auto-draft a mockup. Check Obsidian when ready."
        send_tg(msg_txt)
        m.store(uid, "+FLAGS", "\\Seen")
        processed += 1

    m.logout()
    print(f"Processed {processed} prospect replies.")

if __name__ == "__main__":
    main()
