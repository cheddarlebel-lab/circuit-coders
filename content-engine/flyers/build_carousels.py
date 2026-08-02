#!/usr/bin/env python3
# Renders the 3 social carousels (source of truth: claude.ai/design project
# "Circuit Coders — Social") to PNGs for IG posting. 1080x1350, Space Grotesk.
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "out", "CAROUSELS-2026-07")
os.makedirs(OUT, exist_ok=True)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def shell(content, count, tag, small=70, sub=39):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html,body {{ width:1080px; height:1350px; }}
  body {{ font-family:'Space Grotesk',-apple-system,system-ui,sans-serif; background:#06061A; color:#EEF2F8; position:relative; overflow:hidden; -webkit-font-smoothing:antialiased; }}
  .glow {{ position:absolute; top:-220px; right:-170px; width:760px; height:760px; background:radial-gradient(circle,rgba(38,235,163,0.18),transparent 62%); filter:blur(30px); }}
  .glow2 {{ position:absolute; bottom:-260px; left:-160px; width:640px; height:640px; background:radial-gradient(circle,rgba(38,235,163,0.06),transparent 65%); filter:blur(40px); }}
  .grid {{ position:absolute; inset:0; opacity:0.045; background-image:radial-gradient(circle,#6b7a99 1.2px,transparent 1.3px); background-size:44px 44px; }}
  .vig {{ position:absolute; inset:0; background:radial-gradient(ellipse at center,transparent 55%,rgba(6,6,20,0.55) 100%); }}
  .frame {{ position:relative; z-index:2; height:100%; padding:92px 88px 84px; display:flex; flex-direction:column; }}
  .brand {{ display:flex; align-items:center; gap:15px; }}
  .bolt {{ width:42px; height:42px; filter:drop-shadow(0 0 14px rgba(38,235,163,0.5)); }}
  .wordmark {{ font-size:25px; font-weight:600; letter-spacing:3.5px; color:#8590a6; }}
  .content {{ margin-top:auto; margin-bottom:auto; }}
  .num {{ font-size:96px; font-weight:700; color:#26EBA3; line-height:1; margin-bottom:26px; letter-spacing:-2px; }}
  .headline {{ font-size:80px; font-weight:700; line-height:1.07; letter-spacing:-2px; max-width:910px; }}
  .headline.small {{ font-size:{small}px; }}
  .g {{ color:#26EBA3; }}
  .sub {{ font-size:{sub}px; font-weight:500; color:#a7afc0; margin-top:30px; letter-spacing:-0.5px; line-height:1.25; }}
  .cta {{ display:inline-flex; align-items:center; gap:14px; background:#26EBA3; color:#04160E; font-size:37px; font-weight:700; padding:30px 46px; border-radius:22px; margin-top:52px; letter-spacing:-0.5px; box-shadow:0 14px 50px rgba(38,235,163,0.28); }}
  .foot {{ display:flex; justify-content:space-between; align-items:center; }}
  .count {{ font-size:25px; font-weight:600; color:#5d6a85; letter-spacing:3px; }}
  .tag {{ font-size:25px; font-weight:500; color:#5d6a85; letter-spacing:1px; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="glow2"></div>
  <div class="grid"></div>
  <div class="vig"></div>
  <div class="frame">
    <div class="brand">
      <svg class="bolt" viewBox="0 0 100 100"><polygon points="58,7 27,55 47,55 40,93 75,41 53,41" fill="#2EE6A0"></polygon></svg>
      <span class="wordmark">CIRCUIT CODERS</span>
    </div>
    <div class="content">{content}</div>
    <div class="foot"><span class="count">{count}</span><span class="tag">{tag}</span></div>
  </div>
</body>
</html>"""

CAROUSELS = {
    "missed-calls": [
        ("<div class='headline'>Every missed call is a <span class='g'>lost job.</span></div>", "swipe →"),
        ("<div class='headline small'>You’re on a job. The phone rings. <span class='g'>Nobody answers.</span></div>", "circuitcoders.com"),
        ("<div class='headline small'>They don’t leave a voicemail. They just <span class='g'>call the next shop.</span></div>", "circuitcoders.com"),
        ("<div class='headline small'>Our <span class='g'>AI receptionist</span> answers 24/7 — books the job, texts you the lead.</div>", "circuitcoders.com"),
        ("<div class='headline'>Hear it live:</div><div class='sub' style='font-size:52px;color:#26EBA3;font-weight:700;margin-top:18px;'>(760) 546-9189</div><div class='sub'>Bilingual. Answers every call. $500 setup + $297/mo.</div><div class='cta'>Call the demo →</div>", "link in bio"),
    ],
    "1500": [
        ("<div class='headline'>What <span class='g'>$1,500</span> actually gets your business</div>", "swipe →"),
        ("<div class='num'>01</div><div class='headline small'>A <span class='g'>custom-coded</span> site — not a template. Fast + mobile-first.</div>", "circuitcoders.com"),
        ("<div class='num'>02</div><div class='headline small'>Built for <span class='g'>Google</span> — so you show up in “near me” searches</div>", "circuitcoders.com"),
        ("<div class='num'>03</div><div class='headline small'><span class='g'>Live in 7 days.</span> You see it before you pay a dime.</div>", "circuitcoders.com"),
        ("<div class='headline'>Agencies charge <span class='g'>$5k+.</span> We don’t.</div><div class='sub'>Custom site, live in a week — free preview before you pay.</div><div class='cta'>Get your free preview →</div>", "link in bio"),
    ],
    "invisible-on-google": [
        ("<div class='headline'>3 signs your business is <span class='g'>invisible</span> on Google</div>", "swipe →"),
        ("<div class='num'>01</div><div class='headline small'>Nobody finds you when they search <span class='g'>“plumber near me”</span></div>", "circuitcoders.com"),
        ("<div class='num'>02</div><div class='headline small'>Your “website” is a Facebook page — or a <span class='g'>dead Wix link</span></div>", "circuitcoders.com"),
        ("<div class='num'>03</div><div class='headline small'>You <span class='g'>miss calls</span> — and missed calls never call back</div>", "circuitcoders.com"),
        ("<div class='headline'>We fix all <span class='g'>three.</span></div><div class='sub'>Custom site, local SEO, and an AI receptionist — you see it before you pay.</div><div class='cta'>Get your free preview →</div>", "link in bio"),
    ],
}
SIZES = {"missed-calls": (70, 39), "1500": (70, 39), "invisible-on-google": (72, 40)}

for name, slides in CAROUSELS.items():
    small, sub = SIZES[name]
    for i, (content, tag) in enumerate(slides, 1):
        html = shell(content, f"{i:02d} / 05", tag, small, sub)
        path = os.path.join(HERE, f"_tmp_{name}-{i}.html")
        open(path, "w").write(html)
        png = os.path.join(OUT, f"{name}-{i}.png")
        subprocess.run([CHROME, "--headless=new", f"--screenshot={png}",
                        "--window-size=1080,1350", "--hide-scrollbars",
                        "--virtual-time-budget=8000", f"file://{path}"],
                       check=True, capture_output=True)
        os.remove(path)
        print("rendered", os.path.basename(png))
print("done -> out/CAROUSELS-2026-07/")
