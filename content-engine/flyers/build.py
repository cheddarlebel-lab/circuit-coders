#!/usr/bin/env python3
# Circuit Coders — capability flyer set (1080x1350, HTML -> headless Chrome PNG).
# Sources are self-contained (logo inlined) so they can be pushed to claude.ai/design for editing.
import os, subprocess, glob

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "out", "FLYERS-2026-07")
os.makedirs(OUT, exist_ok=True)
LOGO = open(os.path.join(HERE, "logo.b64")).read().strip()
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; overflow:hidden; }
body {
  background:#06061a; color:#fff; position:relative;
  font-family:-apple-system, system-ui, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing:antialiased;
}
.glow { position:absolute; inset:0; z-index:0;
  background:
    radial-gradient(900px 700px at 12% -8%, rgba(0,230,138,.10), transparent 62%),
    radial-gradient(760px 620px at 108% 108%, rgba(0,230,138,.05), transparent 60%);
}
.traces { position:absolute; right:0; bottom:0; z-index:0; opacity:.9; }
.frame { position:absolute; inset:26px; border:1px solid rgba(255,255,255,.07); z-index:1; }
.page { position:relative; z-index:2; height:100%; padding:88px 92px 74px; display:flex; flex-direction:column; }
.brandrow { display:flex; align-items:center; justify-content:space-between; }
.brand { display:flex; align-items:center; gap:22px; }
.brand img { width:64px; height:64px; border-radius:14px; }
.wordmark { font-size:27px; font-weight:700; letter-spacing:.32em; color:rgba(255,255,255,.92); }
.kicker { font-size:22px; font-weight:700; letter-spacing:.26em; color:#00e68a; }
.hero { margin-top:92px; }
h1 { font-size:72px; line-height:1.08; letter-spacing:-0.028em; font-weight:800; }
h1 .g { color:#00e68a; }
.sub { margin-top:48px; font-size:34px; line-height:1.42; color:#aebcb6; max-width:820px; font-weight:400; }
.features { margin-top:64px; display:flex; flex-direction:column; gap:38px; }
.feat { display:flex; align-items:center; gap:24px; font-size:31px; color:rgba(255,255,255,.88); font-weight:500; }
.feat .tick { width:14px; height:14px; background:#00e68a; border-radius:3px; flex:none;
  box-shadow:0 0 14px rgba(0,230,138,.55); }
.spacer { flex:1; }
.pricechip { display:inline-flex; align-self:flex-start; margin-top:72px; padding:22px 38px;
  border:1.5px solid rgba(0,230,138,.55); border-radius:999px;
  color:#00e68a; font-size:29px; font-weight:700; letter-spacing:.01em; }
.footer { border-top:1px solid rgba(255,255,255,.10); padding-top:34px; margin-top:48px;
  display:flex; justify-content:space-between; align-items:baseline; }
.footer .site { font-size:31px; font-weight:700; color:#00e68a; letter-spacing:.01em; }
.footer .aux { font-size:27px; color:#8fa39b; font-weight:500; }
.footer .aux b { color:rgba(255,255,255,.92); font-weight:700; }
/* overview grid */
.grid { margin-top:64px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; }
.cell { border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:26px 24px;
  background:rgba(255,255,255,.015); }
.cell .t { font-size:26px; font-weight:700; color:rgba(255,255,255,.94); line-height:1.2; }
.cell .p { margin-top:12px; font-size:22px; font-weight:600; color:#00e68a; }
"""

TRACES = """<svg class="traces" width="430" height="380" viewBox="0 0 430 380" fill="none">
<g stroke="#00e68a" stroke-opacity="0.10" stroke-width="2">
<path d="M430 90 H300 L260 130 V220 L210 270 H120"/>
<path d="M430 170 H330 L290 210 V300 L250 340 H170"/>
<path d="M430 250 H360 L330 280 V380"/>
<path d="M260 380 V330 L230 300 H150"/>
</g>
<g fill="#00e68a" fill-opacity="0.22">
<circle cx="120" cy="270" r="6"/><circle cx="170" cy="340" r="6"/>
<circle cx="150" cy="300" r="5"/><circle cx="330" cy="280" r="5"/>
</g></svg>"""

def shell(label, body):
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{CSS}</style></head>
<body>
<div class="glow"></div>{TRACES}<div class="frame"></div>
<div class="page">
  <div class="brandrow">
    <div class="brand"><img src="data:image/png;base64,{LOGO}" alt="">
      <div class="wordmark">CIRCUIT&nbsp;CODERS</div></div>
    <div class="kicker">{label}</div>
  </div>
  {body}
</div>
</body></html>"""

def standard(label, h1, sub, feats, price, aux):
    feats_html = "\n".join(f'<div class="feat"><div class="tick"></div>{f}</div>' for f in feats)
    return shell(label, f"""
  <div class="hero"><h1>{h1}</h1></div>
  <div class="sub">{sub}</div>
  <div class="features">{feats_html}</div>
  <div class="pricechip">{price}</div>
  <div class="spacer"></div>
  <div class="footer"><div class="site">circuitcoders.com</div><div class="aux">{aux}</div></div>""")

CELLS = [
    ("Business Websites", "from $1,500"),
    ("Local SEO &amp; Google Maps", "$199 + $149/mo"),
    ("AI Receptionist", "from $500 + $297/mo"),
    ("Web Apps &amp; SaaS", "from $2,500"),
    ("Mobile Apps", "iOS + Android"),
    ("AI &amp; Automation", "custom scope"),
    ("E-commerce &amp; Payments", "from $2,500"),
    ("Hardware &amp; IoT", "quoted per build"),
    ("Branding &amp; 3D Printing", "add-on"),
]

overview_body = f"""
  <div class="hero"><h1>Everything your business<br>needs to <span class="g">win online.</span></h1></div>
  <div class="sub" style="margin-top:34px">Websites, AI, apps, and hardware — designed, built, and shipped by one local team. Fixed price, quoted up front.</div>
  <div class="grid">{''.join(f'<div class="cell"><div class="t">{t}</div><div class="p">{p}</div></div>' for t, p in CELLS)}</div>
  <div class="spacer"></div>
  <div class="footer"><div class="site">circuitcoders.com</div><div class="aux">Hear our AI live &nbsp;<b>(760) 546-9189</b></div></div>"""

FLYERS = {
    "flyer-1-overview.html": shell("FULL-STACK STUDIO", overview_body),
    "flyer-2-receptionist.html": standard(
        "AI RECEPTIONIST",
        'Never miss another call.<br><span class="g">Nights, weekends. 24/7.</span>',
        "A bilingual voice agent that picks up every call, books and qualifies the job, and texts you the details.",
        ["Answers 24/7 — no voicemail, no hold", "Books &amp; qualifies every lead",
         "Bilingual — English &amp; Spanish", "Texts you a summary of every caller"],
        "From $500 setup + $297/mo",
        'Hear it live &nbsp;<b>(760) 546-9189</b>'),
    "flyer-3-websites.html": standard(
        "BUSINESS WEBSITES",
        'Built from scratch.<br><span class="g">Never a template.</span>',
        "Custom, conversion-focused sites with an admin dashboard — you run your own content, no developer needed for edits.",
        ["Custom design, built for your brand", "Mobile-first and fast",
         "Admin dashboard — edit it yourself", "Lead capture + Stripe payments"],
        "From $1,500 · fixed price",
        "See a live preview before you pay"),
    "flyer-4-localseo.html": standard(
        "LOCAL SEO &amp; MAPS",
        '"Near me" searches show<br>the map. <span class="g">Be on it.</span>',
        "When customers search for your trade, the map pack appears before any website. We put you in it — and keep you there.",
        ["Google Business Profile build-out", "Local schema + on-page SEO",
         "Weekly Google posts", "Review ask-flow that builds stars"],
        "$199 setup + $149/mo",
        "Free ranking audit"),
    "flyer-5-software.html": standard(
        "APPS &amp; SOFTWARE",
        'Got an idea for an app?<br><span class="g">We build and ship it.</span>',
        "Full-stack web apps and native iOS &amp; Android — auth, databases, dashboards, payments — built end to end and shipped to the stores.",
        ["Web apps &amp; SaaS with recurring billing", "Native iOS &amp; Android",
         "Database, admin panel, user accounts", "App Store submission handled"],
        "Web apps from $2,500",
        "Our own apps are live on the App Store"),
}


FLYERS["flyer-6-proof-lothours.html"] = shell("SHIPPED & LIVE", f"""
  <div class="hero"><h1>We don't just build apps.<br><span class="g">We ship them.</span></h1></div>
  <div class="sub">LotHours — our workforce platform for car dealerships — is live on the App Store right now. Designed, built, and shipped end to end by this team.</div>
  <div class="features">
    <div class="feat"><div class="tick"></div>Native iOS app — live on the App Store</div>
    <div class="feat"><div class="tick"></div>Web dashboard, payments, geofencing</div>
    <div class="feat"><div class="tick"></div>Built end to end by Circuit Coders</div>
    <div class="feat"><div class="tick"></div>Your product could be next</div>
  </div>
  <div class="pricechip">Search "LotHours" on the App Store</div>
  <div class="spacer"></div>
  <div class="footer"><div class="site">circuitcoders.com</div><div class="aux">Web apps from <b>$2,500</b></div></div>""")

FLYERS["flyer-7-checklist.html"] = shell("QUICK CHECK", f"""
  <div class="hero"><h1>Is your website<br><span class="g">costing you jobs?</span></h1></div>
  <div class="sub">Four things to check in the next 60 seconds:</div>
  <div class="features">
    <div class="feat"><div class="tick"></div>Does it load in under 3 seconds on a phone?</div>
    <div class="feat"><div class="tick"></div>Can a customer contact you in one tap?</div>
    <div class="feat"><div class="tick"></div>Do you show up on Google Maps?</div>
    <div class="feat"><div class="tick"></div>Has it been updated in the last year?</div>
  </div>
  <div class="pricechip">Any "no"? We should talk.</div>
  <div class="spacer"></div>
  <div class="footer"><div class="site">circuitcoders.com</div><div class="aux">Free audit — no obligation</div></div>""")

FLYERS["flyer-8-demo-line.html"] = shell("LIVE DEMO", f"""
  <div class="hero"><h1>Don't take our word<br>for it. <span class="g">Call our AI.</span></h1></div>
  <div class="sub">Our AI receptionist answers this line 24/7. Call it right now and hear exactly what your customers would.</div>
  <div style="margin-top:80px; text-align:center;">
    <div style="font-size:88px; font-weight:800; color:#00e68a; letter-spacing:-0.01em;">(760) 546-9189</div>
    <div style="margin-top:22px; font-size:29px; color:#8fa39b; font-weight:500;">Answers day and night — go ahead, test it</div>
  </div>
  <div class="spacer"></div>
  <div class="footer"><div class="site">circuitcoders.com</div><div class="aux">From <b>$500 setup + $297/mo</b></div></div>""")

for name, html in FLYERS.items():
    path = os.path.join(HERE, name)
    open(path, "w").write(html)
    png = os.path.join(OUT, name.replace(".html", ".png"))
    subprocess.run([CHROME, "--headless=new", f"--screenshot={png}",
                    "--window-size=1080,1350", "--hide-scrollbars",
                    "--force-device-scale-factor=1", f"file://{path}"],
                   check=True, capture_output=True)
    print("rendered", os.path.basename(png))
print("done:", len(FLYERS), "flyers ->", os.path.relpath(OUT, HERE))
