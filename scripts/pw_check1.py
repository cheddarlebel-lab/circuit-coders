#!/usr/bin/env python3
# Confirm ad1 (2nd draft) has a real creative: select it, reveal Media, turn preview on, screenshot.
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

def rows(pg):
    loc = pg.get_by_text("New Traffic Ad", exact=False)
    out = []
    for i in range(loc.count()):
        try:
            b = loc.nth(i).bounding_box()
            if b and b["x"] < 500: out.append((b["y"], loc.nth(i)))
        except Exception: pass
    out.sort(key=lambda t: t[0]); return [r for _, r in out]

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1440,"height":1000},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(6500)
    rr = rows(pg)
    rr[1].scroll_into_view_if_needed(); rr[1].click(); pg.wait_for_timeout(3500)
    # turn on Ad preview
    tog = pg.get_by_text("Ad preview", exact=True)
    try:
        tog.first.scroll_into_view_if_needed()
        # the toggle is a switch just left of the label
        pg.mouse.click(925, 135); pg.wait_for_timeout(2500)
    except Exception as e:
        print("toggle err", e)
    # report media presence
    body = pg.inner_text("body")
    print("has 'Media':", "Media" in body, "| 'Remove media':", pg.get_by_text("Remove media", exact=False).count(),
          "| 'Add media':", pg.get_by_text("Add media", exact=False).count())
    pg.screenshot(path=f"{SHOT}/pw_check1.png")
    br.close()
