#!/usr/bin/env python3
"""Saunders access-watch — ping Leo when Jared sends access.

Polls cheddar.lebel@gmail.com (read-only token) for two signals:
  1. Any new mail FROM Jared (jareds@toyotaofvero.com / toyotaofvero.com)
  2. Manager/admin INVITE emails (Google Business Profile, Facebook, Yelp, etc.)
On a new match → macOS notification + append to ~/memory/log.md so the CLI agent sees it.

Dedups by Gmail message id. Designed for launchd every ~15 min.
State: clients/saunders/.access-watch-seen.json
"""
import base64
import json
import pathlib
import subprocess
import urllib.parse
import urllib.request

HOME = pathlib.Path.home()
TOKEN = HOME / ".gmail_token.json"
SEEN = pathlib.Path(__file__).resolve().parent / ".access-watch-seen.json"
LOG = HOME / "memory" / "log.md"

# Two Gmail search queries. newer_than keeps it cheap; dedup handles overlap.
QUERIES = [
    'in:inbox newer_than:7d (from:jareds@toyotaofvero.com OR from:toyotaofvero.com)',
    ('in:inbox newer_than:7d ('
     '"invited you to manage" OR "added you as a manager" OR "added you as an admin" '
     'OR "you\'ve been added" OR "ownership" OR "access to your Business Profile" '
     'OR from:businessprofile-noreply@google.com OR from:noreply-business-profile@google.com '
     'OR from:notify@yelp.com OR from:facebookmail.com OR subject:DealerRater OR subject:CARFAX)'),
]


def access_token():
    d = json.load(open(TOKEN))
    body = urllib.parse.urlencode({
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=body)))["access_token"]


def api(path, tok):
    req = urllib.request.Request("https://gmail.googleapis.com/gmail/v1/users/me/" + path,
                                 headers={"Authorization": f"Bearer {tok}"})
    return json.load(urllib.request.urlopen(req))


def header(msg, name):
    for h in msg.get("payload", {}).get("headers", []):
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""


def notify(title, message):
    subprocess.run(["osascript", "-e",
                    'on run argv\ndisplay notification (item 1 of argv) with title (item 2 of argv) '
                    'sound name "Glass"\nend run', message, title], check=False)


def main():
    seen = set(json.load(open(SEEN))) if SEEN.exists() else set()
    tok = access_token()
    ids = []
    for q in QUERIES:
        r = api("messages?q=" + urllib.parse.quote(q) + "&maxResults=20", tok)
        ids += [m["id"] for m in r.get("messages", [])]

    fresh = [i for i in dict.fromkeys(ids) if i not in seen]
    hits = []
    for mid in fresh:
        m = api(f"messages/{mid}?format=metadata&metadataHeaders=From&metadataHeaders=Subject", tok)
        frm, subj = header(m, "From"), header(m, "Subject")
        hits.append((frm, subj))
        seen.add(mid)

    json.dump(sorted(seen), open(SEEN, "w"))

    if hits:
        first = hits[0]
        notify("Saunders — ACCESS from Jared?",
               f"{len(hits)} new: {first[1][:60]} — {first[0][:40]}")
        with open(LOG, "a") as f:
            f.write(f"\n[access-watch] {len(hits)} new access-signal email(s) for Saunders:\n")
            for frm, subj in hits:
                f.write(f"  - {subj}  <{frm}>\n")
    print(f"access-watch: {len(hits)} new (of {len(fresh)} fresh / {len(seen)} seen total)")


if __name__ == "__main__":
    main()
