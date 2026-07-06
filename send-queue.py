#!/usr/bin/env python3
"""Send each queued pitch via IONOS SMTP, log it, remove from queue."""
import json, smtplib, ssl, time, random, pathlib, datetime, os, sys
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

def _load_secrets():
    envf = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".secrets", "monitor.env")
    if not os.path.exists(envf):
        return
    with open(envf) as f:
        for line in f:
            line = line.strip()
            if line.startswith("export "):
                line = line[7:]
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_secrets()

# Secrets from .secrets/monitor.env (gitignored) — never hardcode.
USER = os.environ.get("IONOS_USER", "admin@circuitcoders.com")
PW = os.environ.get("IONOS_PW", "")
HOST = "smtp.ionos.com"
PORT = 465  # SSL

if not PW:
    sys.exit("IONOS_PW not set — source .secrets/monitor.env before running.")

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
QUEUE = LOG / "queue.jsonl"
SENT = LOG / "sent.jsonl"
ERRORS = LOG / "send-errors.jsonl"
PROGRESS = LOG / "send-progress.log"

FROM_DISPLAY = "Leo Lebel"

def log_progress(msg):
    line = f"[{datetime.datetime.now().isoformat(timespec='seconds')}] {msg}\n"
    PROGRESS.write_text((PROGRESS.read_text() if PROGRESS.exists() else "") + line)
    print(line, end="", flush=True)

def send_one(server, item):
    msg = MIMEText(item["body"], "plain", "utf-8")
    msg["From"] = f"{FROM_DISPLAY} <{USER}>"
    msg["To"] = item["email"]
    msg["Reply-To"] = USER
    msg["Subject"] = item["subject"]
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="circuitcoders.com")
    server.sendmail(USER, [item["email"]], msg.as_string())
    return msg["Message-ID"]

def main():
    items = [json.loads(l) for l in QUEUE.read_text().splitlines() if l.strip()]
    log_progress(f"queue loaded: {len(items)} pitches to send")
    if not items:
        log_progress("queue empty — nothing to do")
        return

    ctx = ssl.create_default_context()
    sent_records = []
    remaining = list(items)
    failed = []

    for i, item in enumerate(items, 1):
        try:
            with smtplib.SMTP_SSL(HOST, PORT, context=ctx, timeout=30) as srv:
                srv.login(USER, PW)
                mid = send_one(srv, item)
            rec = {**item, "sent_at": datetime.datetime.now().isoformat(),
                   "message_id": mid, "status": "sent"}
            with SENT.open("a") as f:
                f.write(json.dumps(rec) + "\n")
            sent_records.append(rec)
            remaining = [x for x in remaining if x["email"] != item["email"]]
            QUEUE.write_text("\n".join(json.dumps(x) for x in remaining) + ("\n" if remaining else ""))
            log_progress(f"[{i}/{len(items)}] ✓ sent → {item['prospect']} <{item['email']}>")
        except Exception as e:
            failed.append({"prospect": item["prospect"], "email": item["email"], "error": str(e)})
            with ERRORS.open("a") as f:
                f.write(json.dumps({"prospect": item["prospect"], "email": item["email"],
                                    "error": str(e), "at": datetime.datetime.now().isoformat()}) + "\n")
            log_progress(f"[{i}/{len(items)}] ✗ FAIL → {item['prospect']}: {e}")

        # space sends 30–60s apart, except the last
        if i < len(items):
            delay = random.randint(30, 60)
            log_progress(f"   ...sleeping {delay}s")
            time.sleep(delay)

    log_progress(f"DONE: sent={len(sent_records)} failed={len(failed)}")

if __name__ == "__main__":
    main()
