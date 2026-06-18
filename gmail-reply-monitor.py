#!/usr/bin/env python3
"""Poll Gmail (cheddar.lebel@gmail.com) for replies to outreach threads.

Covers the gap the IONOS monitor (outreach-monitor.py) can't see: pitches sent
from the personal Gmail via gmail-api / gmail-api-resend / followups.

For each known outreach thread, looks for incoming messages newer than the last
check. Bounces (mailer-daemon) are classified separately. Human replies fire a
macOS notification + log.md line and append to the prospect's Obsidian page.
(Telegram retired per Leo 2026-06-11.)

Designed for launchd every 15 min. State in outreach-log/gmail-monitor-state.json.
"""
import json, re, base64, pathlib, datetime, urllib.request, urllib.parse, sys

HOME = pathlib.Path.home()
LOG = HOME / "clawd/circuit-coders/outreach-log"
STATE = LOG / "gmail-monitor-state.json"
REPLIES = LOG / "gmail-replies.jsonl"
OBSIDIAN_DIR = HOME / "SecondBrain/circuit-coders/outreach"
ME = "cheddar.lebel@gmail.com"

def refresh_token():
    d = json.load(open(HOME / ".gmail_read_token.json"))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    resp = json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))
    return resp["access_token"]

def api_get(tok, path):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        f"https://gmail.googleapis.com/gmail/v1/users/me/{path}",
        headers={"Authorization": f"Bearer {tok}"})))

def hdr(m, name):
    return next((h["value"] for h in m.get("payload", {}).get("headers", [])
                 if h["name"].lower() == name.lower()), "")

def text_of(m):
    def walk(p):
        if p.get("mimeType") == "text/plain" and p.get("body", {}).get("data"):
            return base64.urlsafe_b64decode(p["body"]["data"]).decode(errors="replace")
        for sub in p.get("parts", []) or []:
            t = walk(sub)
            if t:
                return t
        return ""
    return walk(m.get("payload", {}))

def notify(text):
    """Leo retired Telegram (2026-06-11). Alert = macOS notification + log.md line;
    full reply already lands in gmail-replies.jsonl + Obsidian for the next session."""
    import subprocess
    first = text.splitlines()[0].replace('"', "'")
    try:
        subprocess.run(["osascript", "-e",
                        f'display notification "{first}" with title "Circuit Coders — outreach reply" sound name "Glass"'],
                       timeout=10)
    except Exception as e:
        print(f"notification failed: {e}", file=sys.stderr)
    try:
        with open(HOME / "memory/log.md", "a") as f:
            f.write(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}] [monitor] {first}\n")
    except Exception:
        pass

def update_obsidian(prospect, frm, body):
    safe = re.sub(r'[<>:"/\\|?*]', "", prospect).strip() or "unknown"
    path = OBSIDIAN_DIR / f"{safe}.md"
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    entry = f"\n## {ts} — REPLY (gmail channel)\nFrom: {frm}\n\n> {body[:1500]}\n"
    if path.exists():
        path.write_text(path.read_text() + entry)
    else:
        path.write_text(f"# {prospect}\n\nstatus: replied\n{entry}")

def known_threads(tok):
    """prospect -> thread info from sent.jsonl + followups.jsonl"""
    threads = {}
    for fname in ["sent.jsonl", "followups.jsonl"]:
        p = LOG / fname
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            if not line.strip():
                continue
            r = json.loads(line)
            tid = r.get("thread_id")
            mid = r.get("resend_message_id") or r.get("bump_gmail_id") or r.get("message_id")
            if not tid and r.get("channel", "").startswith("gmail") and mid:
                try:
                    tid = api_get(tok, f"messages/{mid}?format=minimal")["threadId"]
                except Exception:
                    continue
            if tid:
                threads[tid] = {"prospect": r.get("prospect", "?"), "email": r.get("email", "?")}
    return threads

def main():
    tok = refresh_token()
    state = json.loads(STATE.read_text()) if STATE.exists() else {"seen_msg_ids": []}
    seen = set(state["seen_msg_ids"])
    threads = known_threads(tok)
    new_replies, new_bounces = [], []

    for tid, info in threads.items():
        try:
            th = api_get(tok, f"threads/{tid}?format=metadata&metadataHeaders=From"
                              "&metadataHeaders=Date&metadataHeaders=Subject")
        except Exception:
            continue
        for m in th.get("messages", []):
            mid = m["id"]
            frm = hdr(m, "From")
            if mid in seen or ME in frm.lower():
                seen.add(mid)
                continue
            seen.add(mid)
            if "mailer-daemon" in frm.lower() or "postmaster" in frm.lower():
                new_bounces.append((info, frm))
                continue
            # human reply — fetch body
            try:
                full = api_get(tok, f"messages/{mid}?format=full")
                body = text_of(full)
            except Exception:
                body = "(could not fetch body)"
            new_replies.append((info, frm, body))
            with open(REPLIES, "a") as f:
                f.write(json.dumps({"prospect": info["prospect"], "email": info["email"],
                                    "from": frm, "thread_id": tid, "msg_id": mid,
                                    "body": body[:3000],
                                    "at": datetime.datetime.now(datetime.timezone.utc).isoformat()}) + "\n")
            update_obsidian(info["prospect"], frm, body)
            notify(f"🔥 OUTREACH REPLY — {info['prospect']} <{info['email']}>")

    state["seen_msg_ids"] = sorted(seen)
    state["last_run"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    STATE.write_text(json.dumps(state))
    print(f"checked {len(threads)} threads: {len(new_replies)} replies, {len(new_bounces)} new bounces")
    for info, frm in new_bounces:
        print(f"  bounce: {info['prospect']} <{info['email']}>")

if __name__ == "__main__":
    main()
