#!/usr/bin/env python3
# Probe editor tree: (1) can we switch ads by clicking a row? (2) does a row menu offer Duplicate?
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
    pg.wait_for_timeout(7000)
    rows = pg.get_by_text("New Traffic Ad", exact=True)
    print("rows:", rows.count(), "| url:", pg.url[-40:])

    # try right-clicking the 2nd row to get a context menu, and hover to reveal per-row controls
    for i in range(rows.count()):
        try:
            box = rows.nth(i).bounding_box()
            print(f"  row{i} box:", None if not box else {k:round(v) for k,v in box.items()})
        except Exception as e:
            print(f"  row{i} box err", e)

    # click the LAST 'New Traffic Ad' row and see if preview/url changes
    try:
        rows.last.click(); pg.wait_for_timeout(3000)
        print("after click last -> url:", pg.url[-40:])
        pg.screenshot(path=f"{SHOT}/pw_probe_clicklast.png")
    except Exception as e:
        print("click last err", e)

    # hover the last row, then screenshot to reveal any "..." control
    try:
        rows.last.hover(); pg.wait_for_timeout(800)
        pg.screenshot(path=f"{SHOT}/pw_probe_hover.png")
    except Exception as e:
        print("hover err", e)

    # try the "Action menu" button (per inspect) and dump menu items
    am = pg.get_by_role("button", name="Action menu")
    print("Action menu buttons:", am.count())
    if am.count():
        try:
            am.first.click(); pg.wait_for_timeout(1200)
            pg.screenshot(path=f"{SHOT}/pw_probe_actionmenu.png")
            for item in ("Duplicate", "Delete", "Rename", "Create ad", "Copy"):
                print(f"   menu has '{item}':", pg.get_by_text(item, exact=True).count())
        except Exception as e:
            print("action menu err", e)
    br.close()
