#!/usr/bin/env python3
# Build one single-image ad per uploaded photo (PAUSED drafts) in the logged-in session.
# Usage: python3 pw_build_all.py [LIMIT]   (LIMIT photos, default all 18)
import glob, os, sys, traceback
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
AD_URL = ("https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?"
          "act=1385957480082367&business_id=922594067545558"
          "&selected_campaign_ids=120251825595040264&selected_adset_ids=120251825595060264"
          "&selected_ad_ids=120251825595050264")
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 99

def pw_cookies():
    out = []
    for c in bc.chrome(domain_name='facebook.com'):
        out.append({"name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/", "expires": float(c.expires) if c.expires else -1,
            "httpOnly": False, "secure": bool(c.secure), "sameSite": "Lax"})
    return out

def open_edit_media(pg):
    # open the Media 'Edit' dropdown then 'Edit media'
    edits = pg.get_by_role("button", name="Edit")
    for i in range(edits.count()):
        try:
            edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(600)
            em = pg.get_by_text("Edit media", exact=True)
            if em.count() > 0:
                em.first.click(); return True
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    return False

def select_photo(pg, name):
    if not open_edit_media(pg):
        raise RuntimeError("couldn't open media picker")
    pg.wait_for_timeout(2500)
    box = pg.get_by_placeholder("Search media")
    box.click(); box.fill(name); pg.wait_for_timeout(2800)
    # click the first result tile (first image after the "Account images" heading)
    tile = pg.get_by_text("Account images").locator("xpath=following::img[1]")
    tile.wait_for(state="visible", timeout=9000)
    tile.click(); pg.wait_for_timeout(1200)
    # advance the "Set up your creative" wizard (Media->Crop->Text->...) until it closes
    for step in range(12):
        if pg.get_by_text("Set up your creative").count() == 0:
            break
        clicked = False
        for label in ("Next", "Save and continue", "Publish", "Save", "Done", "Apply"):
            b = pg.get_by_role("button", name=label, exact=True)
            if b.count() > 0 and b.first.is_visible() and b.first.is_enabled():
                try:
                    b.first.click(timeout=6000); clicked = True
                    pg.wait_for_timeout(1800); break
                except Exception:
                    continue
        if not clicked:
            pg.screenshot(path=f"{SHOT}/pw_wizard_stuck_{step}.png"); break
    pg.wait_for_timeout(1500)

def duplicate_current_ad(pg):
    # click the selected ad's "..." in the left tree, then Duplicate
    dots = pg.get_by_role("button", name="More", exact=False)
    # fallback: any small "..." menu button in the left rail
    opened = False
    for loc in [pg.locator("[aria-label*='ptions'] , button[aria-haspopup]"), dots]:
        try:
            loc.first.click(); pg.wait_for_timeout(600)
            dup = pg.get_by_text("Duplicate", exact=True)
            if dup.count() > 0:
                dup.first.click(); opened = True; break
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    pg.wait_for_timeout(2500)
    # a duplicate dialog may need confirm
    for label in ("Duplicate", "Confirm", "Publish"):
        b = pg.get_by_role("button", name=label, exact=True)
        if b.count() > 0:
            try:
                b.last.click(); pg.wait_for_timeout(2500); break
            except Exception: pass
    return opened

def main():
    photos = sorted(glob.glob(os.path.expanduser(
        "~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS/*.png")))[:LIMIT]
    names = [os.path.basename(p).replace(".png", "") for p in photos]
    print("building ads for:", names)
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(viewport={"width":1440,"height":1000},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        ctx.add_cookies(pw_cookies())
        pg = ctx.new_page()
        pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(6000)
        done = 0
        for idx, nm in enumerate(names):
            try:
                if idx > 0:
                    print(f"[{idx}] duplicating base ad…")
                    duplicate_current_ad(pg)
                print(f"[{idx}] setting creative -> {nm}")
                select_photo(pg, nm)
                pg.screenshot(path=f"{SHOT}/pw_ad_{idx:02d}.png")
                done += 1
            except Exception as e:
                print(f"  ✗ {nm}: {type(e).__name__}: {str(e)[:120]}")
                pg.screenshot(path=f"{SHOT}/pw_ad_{idx:02d}_ERR.png")
        print(f"DONE: {done}/{len(names)} ads had creative set")
        br.close()

if __name__ == "__main__":
    main()
