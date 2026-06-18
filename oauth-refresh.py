#!/usr/bin/env python3
"""Re-mint Gmail OAuth tokens (send + readonly in one grant).

Modes:
  url       — print the auth URL to open in Chrome
  serve     — run localhost callback catcher, wait for redirect, save code to /tmp/gmail_oauth_code.txt
  exchange  — exchange captured code, write ~/.gmail_send_token.json + ~/.gmail_read_token.json
"""
import json, sys, pathlib, urllib.request, urllib.parse, datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

HOME = pathlib.Path.home()
PORT = 8765
REDIRECT = f"http://localhost:{PORT}/"
SCOPES = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
CODE_FILE = pathlib.Path("/tmp/gmail_oauth_code.txt")

def creds():
    d = json.load(open(HOME / ".gmail_send_token.json"))
    return d["client_id"], d["client_secret"]

def auth_url():
    cid, _ = creds()
    q = urllib.parse.urlencode({
        "client_id": cid, "redirect_uri": REDIRECT, "response_type": "code",
        "scope": SCOPES, "access_type": "offline", "prompt": "consent",
        "login_hint": "cheddar.lebel@gmail.com",
    })
    return f"https://accounts.google.com/o/oauth2/v2/auth?{q}"

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        code = qs.get("code", [""])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        if code:
            CODE_FILE.write_text(code)
            self.wfile.write(b"<h2>Done. Token captured - you can close this tab.</h2>")
            self.server.got_code = True
        else:
            self.wfile.write(b"<h2>No code in callback.</h2>")
    def log_message(self, *a):
        pass

def serve():
    srv = HTTPServer(("localhost", PORT), H)
    srv.got_code = False
    srv.timeout = 300
    print(f"listening on {REDIRECT} (5 min timeout)", flush=True)
    while not srv.got_code:
        srv.handle_request()
    print("code captured", flush=True)

def exchange():
    cid, secret = creds()
    code = CODE_FILE.read_text().strip()
    body = urllib.parse.urlencode({
        "client_id": cid, "client_secret": secret, "code": code,
        "grant_type": "authorization_code", "redirect_uri": REDIRECT}).encode()
    resp = json.load(urllib.request.urlopen(
        urllib.request.Request("https://oauth2.googleapis.com/token", data=body)))
    expiry = (datetime.datetime.now(datetime.timezone.utc)
              + datetime.timedelta(seconds=resp.get("expires_in", 3600))).isoformat()
    base = {
        "account": "cheddar.lebel@gmail.com", "client_id": cid, "client_secret": secret,
        "refresh_token": resp["refresh_token"], "token": resp["access_token"],
        "token_uri": "https://oauth2.googleapis.com/token", "expiry": expiry,
        "universe_domain": "googleapis.com",
    }
    for path, scope in [(".gmail_send_token.json", "gmail.send"),
                        (".gmail_read_token.json", "gmail.readonly"),
                        (".gmail_token.json", "gmail.readonly")]:
        out = dict(base, scopes=[f"https://www.googleapis.com/auth/{scope}"])
        (HOME / path).write_text(json.dumps(out, indent=2))
    CODE_FILE.unlink(missing_ok=True)
    print("tokens written (send + read + legacy), granted scopes:", resp.get("scope"))

if __name__ == "__main__":
    {"url": lambda: print(auth_url()), "serve": serve, "exchange": exchange}[sys.argv[1]]()
