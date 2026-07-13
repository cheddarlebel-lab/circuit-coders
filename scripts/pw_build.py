#!/usr/bin/env python3
# Assemble uploaded photos into a flexible/dynamic ad (PAUSED) via the logged-in Playwright session.
import glob, os, sys
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
AD_URL = ("https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?"
          "act=1385957480082367&business_id=922594067545558"
          "&selected_campaign_ids=120251825595040264&selected_adset_ids=120251825595060264"
          "&selected_ad_ids=120251825595050264")

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
    ctx = br.new_context(viewport={"width":1440,"height":1000},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(6000)
    # find the format options text
    body = pg.inner_text("body")
    for kw in ["Flexible", "Carousel", "Single image or video", "Dynamic"]:
        print(f"has '{kw}':", kw.lower() in body.lower())
    # scroll the Ad setup / Format area into view + shot
    try:
        pg.get_by_text("Creative source", exact=False).first.scroll_into_view_if_needed()
    except Exception as e:
        print("scroll:", e)
    pg.wait_for_timeout(1200)
    pg.screenshot(path=f"{SHOT}/pw_format.png")
    print("shot saved")
    br.close()
