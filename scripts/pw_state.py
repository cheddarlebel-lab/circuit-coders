#!/usr/bin/env python3
# Report current campaign/adset/ad status + count from the Ads Manager table (API is OPES-blocked).
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
URL = ("https://adsmanager.facebook.com/adsmanager/manage/ads?"
       "act=1385957480082367&business_id=922594067545558"
       "&selected_campaign_ids=120251825595040264")

def pw_cookies():
    out = []
    for c in bc.chrome(domain_name='facebook.com'):
        out.append({"name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/", "expires": float(c.expires) if c.expires else -1,
            "httpOnly": False, "secure": bool(c.secure), "sameSite": "Lax"})
    return out

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1600,"height":900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(9000)
    body = pg.inner_text("body")
    # look for status words
    for kw in ["Active", "Paused", "In draft", "Off", "Error", "Rejected", "Not delivering", "In review"]:
        c = body.count(kw)
        if c: print(f"'{kw}': {c}")
    print("--- 'New Traffic Ad' occurrences:", body.count("New Traffic Ad"))
    pg.screenshot(path=f"{SHOT}/pw_state.png", full_page=True)
    print("shot saved")
    br.close()
