#!/usr/bin/env python3
# Capture any access_token Ads Manager uses against graph.facebook.com (would carry ads scopes).
import re, json
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

AD_URL = ("https://adsmanager.facebook.com/adsmanager/manage/campaigns?"
          "act=1385957480082367&business_id=922594067545558")

def pw_cookies():
    out = []
    for c in bc.chrome(domain_name='facebook.com'):
        out.append({"name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/", "expires": float(c.expires) if c.expires else -1,
            "httpOnly": False, "secure": bool(c.secure), "sameSite": "Lax"})
    return out

tokens = set()
def on_request(req):
    u = req.url
    if "access_token=" in u:
        m = re.search(r"access_token=([A-Za-z0-9|_\-]+)", u)
        if m: tokens.add(m.group(1))
    # also check POST bodies
    try:
        if req.method == "POST" and req.post_data and "access_token" in req.post_data:
            for m in re.finditer(r"access_token=([A-Za-z0-9|_\-]+)", req.post_data):
                tokens.add(m.group(1))
    except Exception:
        pass

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1440,"height":900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.on("request", on_request)
    pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(9000)
    # also scrape the page JS for token-shaped strings (EAAB..., or act-scoped)
    html = pg.content()
    for m in re.finditer(r'(EAA[A-Za-z0-9]{20,})', html):
        tokens.add(m.group(1))
    # the classic ads-manager token global
    for expr in ["__accessToken", "require('CurrentUserInitialData').ACCOUNT_ID"]:
        try:
            v = pg.evaluate(f"() => {{ try {{ return {expr}; }} catch(e) {{ return null; }} }}")
            if v: print(f"{expr} = {str(v)[:40]}")
        except Exception: pass
    br.close()

toks = [t for t in tokens if len(t) > 20]
print(f"\ncaptured {len(toks)} candidate token(s):")
for t in toks:
    print(" ", t[:18] + "…" + t[-6:], f"(len {len(t)})")
# write them for testing
open("/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad/toks.txt","w").write("\n".join(toks))
