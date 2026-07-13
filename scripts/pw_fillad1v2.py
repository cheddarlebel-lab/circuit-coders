#!/usr/bin/env python3
# Get ad1's own ID (from its Action menu), navigate to its standalone editor URL (full render),
# then Add media -> ad-missedcall. Full URL-load renders the blank-ad Media controls reliably.
import re
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
BASE = ("https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?"
        "act=1385957480082367&business_id=922594067545558"
        "&selected_campaign_ids=120251825595040264&selected_adset_ids=120251825595060264"
        "&selected_ad_ids={ad}")

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

def set_missedcall(pg):
    # find + click Add media (full render), then search->select->wizard
    opened = False
    for _ in range(8):
        add = pg.get_by_text("Add media", exact=False)
        if add.count():
            try:
                add.first.scroll_into_view_if_needed(); add.first.click(); pg.wait_for_timeout(2500)
                if pg.get_by_placeholder("Search media").count(): opened = True; break
            except Exception: pass
        pg.mouse.wheel(0, 250); pg.wait_for_timeout(600)
    if not opened: return False
    box = pg.get_by_placeholder("Search media")
    box.click(); box.fill("ad-missedcall"); pg.wait_for_timeout(2800)
    tile = pg.get_by_text("Account images").locator("xpath=following::img[1]")
    tile.wait_for(state="visible", timeout=9000); tile.click(); pg.wait_for_timeout(1200)
    for _ in range(14):
        if pg.get_by_text("Set up your creative").count() == 0: break
        clicked = False
        for label in ("Next", "Save and continue", "Publish", "Save", "Done", "Apply"):
            b = pg.get_by_role("button", name=label, exact=True)
            if b.count() and b.first.is_visible() and b.first.is_enabled():
                try: b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1700); break
                except Exception: continue
        if not clicked: break
    pg.wait_for_timeout(1500); return True

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1440,"height":1000},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(BASE.format(ad="120251825595050264"), wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(6500)

    # select row1 and read its ID from the Action menu
    rr = rows(pg); rr[1].scroll_into_view_if_needed(); rr[1].click(); pg.wait_for_timeout(3500)
    am = pg.get_by_role("button", name="Action menu"); am.first.click(); pg.wait_for_timeout(1200)
    body = pg.inner_text("body")
    ids = re.findall(r"ID:\s*(120251825595\d{6})", body)
    all_ids = re.findall(r"(120251825595\d{6})", body)
    pg.keyboard.press("Escape")
    ad1 = None
    for i in ids + all_ids:
        if i != "120251825595050264" and i not in ("120251825595040264","120251825595060264"):
            ad1 = i; break
    print("ad1 id:", ad1, "| id-matches:", ids[:4], "| all:", sorted(set(all_ids))[:6])
    if not ad1:
        print("could not resolve ad1 id"); pg.screenshot(path=f"{SHOT}/pw_ad1id_ERR.png"); br.close(); raise SystemExit

    # navigate to ad1 by URL (full render) and fill
    pg.goto(BASE.format(ad=ad1), wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout=6500; pg.wait_for_timeout(6500)
    ok = set_missedcall(pg)
    print("filled ad1:", ok)
    rm = pg.get_by_text("Remove media", exact=False).count()
    print(f"ad1 has_media={rm>0}")
    pg.screenshot(path=f"{SHOT}/pw_fillad1v2.png")
    br.close()
