#!/usr/bin/env python3
"""Front-desk web form for the TSM review engine. Stdlib only.

Run:  python3 desk_server.py   ->  open http://localhost:8077
The advisor types the customer's name + cell, taps "Send Review Request,"
and the review text fires (via send_review_request.send).

This is the "mark job done" trigger — no CCC integration needed.
"""
import json, urllib.parse, pathlib
from http.server import BaseHTTPRequestHandler, HTTPServer
import send_review_request as engine

PORT = 8077
HERE = pathlib.Path(__file__).parent

PAGE = """<!DOCTYPE html><html><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>TSM Collision — Send Review Request</title>
<style>
 body{font-family:-apple-system,Helvetica,sans-serif;background:#0a0a14;color:#e8eaf0;margin:0;padding:32px 18px;max-width:480px;margin:auto}
 h1{font-size:22px}.mint{color:#00e68a}
 input{width:100%;padding:14px;margin:8px 0;border-radius:10px;border:1px solid #2a2c48;background:#15162a;color:#fff;font-size:16px;box-sizing:border-box}
 button{width:100%;padding:16px;border:0;border-radius:12px;background:linear-gradient(135deg,#00b36b,#00e68a);color:#06121b;font-weight:800;font-size:17px;margin-top:8px}
 .msg{margin-top:16px;padding:12px 14px;border-radius:10px;background:#15162a;font-size:14px;min-height:20px}
 label{font-size:13px;color:#9aa0b5}
</style></head><body>
<h1>TSM <span class=mint>Review Request</span></h1>
<p style="color:#9aa0b5">Car picked up / job done? Send the customer a quick review text.</p>
<form onsubmit="go(event)">
 <label>Customer name</label><input id=name placeholder="Maria Lopez" required>
 <label>Cell number</label><input id=phone placeholder="(951) 555-0192" required>
 <button>Send Review Request</button>
</form>
<div class=msg id=msg></div>
<script>
async function go(e){e.preventDefault();
 var m=document.getElementById('msg');m.textContent='Sending…';
 var r=await fetch('/send',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({name:name.value,phone:phone.value})});
 var d=await r.json();
 m.textContent=(d.status==='sent'?'✅ Sent to '+d.name:
   d.status==='dry_run'?'🧪 Dry-run (not live yet): '+d.body:
   d.status==='skipped_duplicate'?'⚠️ Already requested for that number':
   '❌ '+(d.error||d.status));
 if(d.status==='sent'||d.status==='dry_run'){name.value='';phone.value='';}
}
</script></body></html>"""

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        self.send_response(200); self.send_header("Content-Type","text/html"); self.end_headers()
        self.wfile.write(PAGE.encode())
    def do_POST(self):
        if self.path != "/send":
            self.send_response(404); self.end_headers(); return
        n = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(n) or b"{}")
        rec = engine.send(data.get("name",""), data.get("phone",""))
        self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()
        self.wfile.write(json.dumps(rec).encode())

if __name__ == "__main__":
    print(f"TSM review desk → http://localhost:{PORT}  (Ctrl+C to stop)")
    HTTPServer(("0.0.0.0", PORT), H).serve_forever()
