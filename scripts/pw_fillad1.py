#!/usr/bin/env python3
# Fill the blank 2nd ad with ad-missedcall. Robustly surface the blank-ad 'Add media' button
# via a scroll-poll, then run the proven picker->search->select->wizard flow.
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
    rr[1].scroll_into_view_if_needed(); rr[1].click(); pg.wait_for_timeout(4000)

    # scroll-poll for 'Add media' within the ad-setup pane
    opened = False
    for step in range(10):
        add = pg.get_by_text("Add media", exact=False)
        if add.count():
            try:
                add.first.scroll_into_view_if_needed(); add.first.click(); pg.wait_for_timeout(2500)
                if pg.get_by_placeholder("Search media").count():
                    opened = True; break
            except Exception: pass
        # also try 'Select media'
        sel = pg.get_by_text("Select media", exact=False)
        if sel.count():
            try:
                sel.first.click(); pg.wait_for_timeout(2000)
                if pg.get_by_placeholder("Search media").count():
                    opened = True; break
            except Exception: pass
        pg.mouse.wheel(0, 250); pg.wait_for_timeout(700)
    print("picker opened for ad1:", opened)

    if opened:
        box = pg.get_by_placeholder("Search media")
        box.click(); box.fill("ad-missedcall"); pg.wait_for_timeout(2800)
        tile = pg.get_by_text("Account images").locator("xpath=following::img[1]")
        tile.wait_for(state="visible", timeout=9000)
        tile.click(); pg.wait_for_timeout(1200)
        for _ in range(14):
            if pg.get_by_text("Set up your creative").count() == 0: break
            clicked = False
            for label in ("Next", "Save and continue", "Publish", "Save", "Done", "Apply"):
                b = pg.get_by_role("button", name=label, exact=True)
                if b.count() and b.first.is_visible() and b.first.is_enabled():
                    try: b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1700); break
                    except Exception: continue
            if not clicked: break
        pg.wait_for_timeout(1500)

    # verify
    rr = rows(pg); rr[1].scroll_into_view_if_needed(); rr[1].click(); pg.wait_for_timeout(3000)
    rm = pg.get_by_text("Remove media", exact=False).count()
    print(f"ad1 now has_media={rm>0} (remove_media={rm})")
    pg.screenshot(path=f"{SHOT}/pw_fillad1.png")
    br.close()
