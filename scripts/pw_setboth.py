#!/usr/bin/env python3
# Deterministically set both draft ads' creatives (ad0=ad-afterhours, ad1=ad-missedcall),
# handling blank ads (Add media) and ads with media (Edit->Edit media). Then verify previews.
import os
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
PHOTOS = os.path.expanduser("~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS")
ASSIGN = ["ad-afterhours", "ad-missedcall"]   # ad0, ad1
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

def picker_open(pg):
    return pg.get_by_placeholder("Search media").count() > 0

def open_picker(pg):
    # blank ad: 'Add media' button
    add = pg.get_by_text("Add media", exact=False)
    if add.count():
        try:
            add.first.scroll_into_view_if_needed(); add.first.click(); pg.wait_for_timeout(2500)
            if picker_open(pg): return "add-media"
        except Exception: pass
    # existing media: Media 'Edit' dropdown -> 'Edit media'
    edits = pg.get_by_role("button", name="Edit")
    for i in range(min(edits.count(), 8)):
        try:
            edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(700)
            em = pg.get_by_text("Edit media", exact=True)
            if em.count():
                em.first.click(); pg.wait_for_timeout(2500)
                if picker_open(pg): return "edit-media"
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    return None

def set_creative(pg, name):
    how = open_picker(pg)
    if not how: raise RuntimeError("picker not opened")
    box = pg.get_by_placeholder("Search media")
    box.click(); box.fill(name); pg.wait_for_timeout(2800)
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
    pg.wait_for_timeout(1000); return how

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1440,"height":1000},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(6500)
    n = len(rows(pg)); print("ad rows:", n)
    for i in range(min(n, len(ASSIGN))):
        nm = ASSIGN[i]
        try:
            rr = rows(pg); rr[i].scroll_into_view_if_needed(); rr[i].click(); pg.wait_for_timeout(3500)
            how = set_creative(pg, nm)
            print(f"  ad{i} -> {nm} (via {how})")
        except Exception as e:
            print(f"  ad{i} -> {nm} FAILED: {type(e).__name__}: {str(e)[:90]}")
            pg.screenshot(path=f"{SHOT}/pw_setboth_{i}_ERR.png")
    # verify: for each ad, report media presence
    print("--- verify ---")
    for i in range(min(n, len(ASSIGN))):
        rr = rows(pg); rr[i].scroll_into_view_if_needed(); rr[i].click(); pg.wait_for_timeout(3000)
        rm = pg.get_by_text("Remove media", exact=False).count()
        add = pg.get_by_text("Add media", exact=False).count()
        print(f"  ad{i}: has_media={rm>0} (remove_media={rm}, add_media={add})")
        pg.screenshot(path=f"{SHOT}/pw_setboth_verify_{i}.png")
    br.close()
