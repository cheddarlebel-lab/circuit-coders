#!/usr/bin/env python3
"""TSM Collision — Review-Request Engine (core sender).

Sends a warm "leave us a review" text to a customer after their job is done.
Twilio REST via stdlib only. Logs every send to sent.jsonl (dedupe + reporting).

Usage:
    python3 send_review_request.py "Maria Lopez" "+19515550192"
    python3 send_review_request.py "Maria Lopez" "+19515550192" --dry-run

Config: copy config.example.env -> .env and fill in:
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (SMS-capable number),
    GOOGLE_REVIEW_LINK (from GBP: https://search.google.com/local/writereview?placeid=<PLACE_ID>)
"""
import sys, os, json, re, base64, urllib.request, urllib.parse, pathlib, datetime

HERE = pathlib.Path(__file__).parent
LOG = HERE / "sent.jsonl"

def load_env():
    env = {}
    f = HERE / ".env"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    # allow real-env override
    for k in ("TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_FROM","GOOGLE_REVIEW_LINK","SHOP_NAME"):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env

def normalize_phone(p):
    digits = re.sub(r"[^\d+]", "", p)
    if digits.startswith("+"):
        return digits
    if len(digits) == 10:
        return "+1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return digits  # let Twilio validate

def first_name(full):
    return (full or "").strip().split(" ")[0] or "there"

def build_message(name, env):
    shop = env.get("SHOP_NAME", "TSM Collision")
    link = env.get("GOOGLE_REVIEW_LINK", "<GOOGLE_REVIEW_LINK_NOT_SET>")
    return (f"Hi {first_name(name)}, thank you for trusting {shop} with your vehicle — "
            f"it was a pleasure taking care of you! If you have a quick moment, a short Google "
            f"review means the world to our shop: {link}  (Reply STOP to opt out.)")

def already_sent(phone):
    if not LOG.exists():
        return False
    for line in LOG.read_text().splitlines():
        if line.strip():
            try:
                if json.loads(line).get("phone") == phone:
                    return True
            except Exception:
                pass
    return False

def log_send(rec):
    with open(LOG, "a") as f:
        f.write(json.dumps(rec) + "\n")

def send(name, phone, dry_run=False):
    env = load_env()
    phone = normalize_phone(phone)
    body = build_message(name, env)
    if already_sent(phone):
        print(f"SKIP {name} {phone}: already requested")
        return {"status": "skipped_duplicate", "phone": phone}
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if dry_run or env.get("TWILIO_ACCOUNT_SID", "").startswith("<"):
        print(f"[DRY-RUN] -> {name} {phone}\n  {body}")
        rec = {"name": name, "phone": phone, "body": body, "sent_at": now, "status": "dry_run"}
        log_send(rec); return rec
    sid = env["TWILIO_ACCOUNT_SID"]; tok = env["TWILIO_AUTH_TOKEN"]; frm = env["TWILIO_FROM"]
    data = urllib.parse.urlencode({"To": phone, "From": frm, "Body": body}).encode()
    auth = base64.b64encode(f"{sid}:{tok}".encode()).decode()
    req = urllib.request.Request(
        f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
        data=data, headers={"Authorization": f"Basic {auth}"})
    try:
        resp = json.load(urllib.request.urlopen(req))
        rec = {"name": name, "phone": phone, "body": body, "sent_at": now,
               "status": "sent", "sid": resp.get("sid")}
        print(f"✓ sent {name} {phone} (sid {resp.get('sid')})")
    except Exception as e:
        rec = {"name": name, "phone": phone, "body": body, "sent_at": now,
               "status": "failed", "error": str(e)}
        print(f"✗ FAILED {name} {phone}: {e}")
    log_send(rec); return rec

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    send(args[0], args[1], dry_run="--dry-run" in sys.argv)
