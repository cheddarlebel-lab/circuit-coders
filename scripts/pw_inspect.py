#!/usr/bin/env python3
# Dump the ad editor's tree rows + available buttons + a row's "..." menu so we can build robustly.
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

    # 1) tree rows: elements containing "New Traffic Ad"
    rows = pg.get_by_text("New Traffic Ad", exact=True)
    print("=== 'New Traffic Ad' text nodes:", rows.count())

    # 2) all "More"/options-style buttons in the left rail
    for sel in ["button[aria-label='More']", "[aria-label*='ptions']",
                "div[role='button'][aria-label]", "button[aria-haspopup='menu']"]:
        loc = pg.locator(sel)
        print(f"=== {sel}: {loc.count()}")

    # 3) hover the first ad row, then look for a nearby options trigger
    try:
        rows.first.hover(); pg.wait_for_timeout(500)
    except Exception as e:
        print("hover err", e)
    pg.screenshot(path=f"{SHOT}/pw_tree_hover.png")

    # 4) enumerate visible buttons with names (top of the list)
    btns = pg.get_by_role("button")
    n = btns.count(); print("=== total buttons:", n)
    names = {}
    for i in range(min(n, 120)):
        try:
            nm = (btns.nth(i).get_attribute("aria-label") or btns.nth(i).inner_text() or "").strip()[:34]
            if nm: names[nm] = names.get(nm, 0) + 1
        except Exception:
            pass
    for k, v in sorted(names.items(), key=lambda x: -x[1])[:45]:
        print(f"   [{v}] {k!r}")
    br.close()
