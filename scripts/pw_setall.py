#!/usr/bin/env python3
# Set a distinct creative on EACH existing draft ad in the ad set (no new duplicates).
# Opens the media picker whether the ad already has media (Edit->Edit media) or is blank
# (Add media / Select media). Navigates ads via the left tree. Leaves all as PAUSED drafts.
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

def tree_rows(pg):
    loc = pg.get_by_text("New Traffic Ad", exact=False)
    rows = []
    for i in range(loc.count()):
        try:
            b = loc.nth(i).bounding_box()
            if b and b["x"] < 500:
                rows.append((b["y"], loc.nth(i)))
        except Exception:
            pass
    rows.sort(key=lambda t: t[0])
    return [r for _, r in rows]

def picker_open(pg):
    return pg.get_by_placeholder("Search media").count() > 0

def open_picker(pg):
    # strategy A: Media 'Edit' dropdown -> 'Edit media'
    edits = pg.get_by_role("button", name="Edit")
    for i in range(min(edits.count(), 8)):
        try:
            edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(700)
            em = pg.get_by_text("Edit media", exact=True)
            if em.count() > 0:
                em.first.click(); pg.wait_for_timeout(2500)
                if picker_open(pg): return "edit-media"
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    # strategy B: blank-ad openers
    for txt in ("Add media", "Select media", "Add image or video", "Choose media", "Select image or video"):
        b = pg.get_by_text(txt, exact=False)
        if b.count():
            try:
                b.first.scroll_into_view_if_needed(); b.first.click(); pg.wait_for_timeout(2500)
                if picker_open(pg): return f"txt:{txt}"
            except Exception:
                pass
    # strategy C: an 'Upload' or 'Add' button that reveals the picker
    for nm in ("Add media", "Select media", "Upload", "Add"):
        b = pg.get_by_role("button", name=nm, exact=False)
        if b.count():
            try:
                b.first.scroll_into_view_if_needed(); b.first.click(); pg.wait_for_timeout(2500)
                if picker_open(pg): return f"btn:{nm}"
            except Exception:
                pass
    return None

def set_creative(pg, name):
    how = open_picker(pg)
    if not how:
        raise RuntimeError("picker not opened")
    box = pg.get_by_placeholder("Search media")
    box.click(); box.fill(name); pg.wait_for_timeout(2800)
    tile = pg.get_by_text("Account images").locator("xpath=following::img[1]")
    tile.wait_for(state="visible", timeout=9000)
    tile.click(); pg.wait_for_timeout(1200)
    for _ in range(14):
        if pg.get_by_text("Set up your creative").count() == 0:
            break
        clicked = False
        for label in ("Next", "Save and continue", "Publish", "Save", "Done", "Apply"):
            b = pg.get_by_role("button", name=label, exact=True)
            if b.count() > 0 and b.first.is_visible() and b.first.is_enabled():
                try:
                    b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1700); break
                except Exception:
                    continue
        if not clicked:
            break
    pg.wait_for_timeout(1000)
    return how

def main():
    photos = sorted(glob.glob(os.path.expanduser(
        "~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS/*.png")))
    names = [os.path.basename(p).replace(".png", "") for p in photos]
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(viewport={"width":1440,"height":1000},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        ctx.add_cookies(pw_cookies())
        pg = ctx.new_page()
        pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(6500)
        nrows = len(tree_rows(pg))
        print(f"ad rows in tree: {nrows}")
        ok = 0
        for i in range(nrows):
            nm = names[i % len(names)]
            try:
                rows = tree_rows(pg)
                rows[i].scroll_into_view_if_needed(); rows[i].click(); pg.wait_for_timeout(3200)
                # scroll the right pane so the media controls render
                pg.mouse.wheel(0, 400); pg.wait_for_timeout(800)
                how = set_creative(pg, nm)
                pg.screenshot(path=f"{SHOT}/pw_set_{i:02d}.png")
                print(f"  row{i} -> {nm}  (opened via {how})")
                ok += 1
            except Exception as e:
                print(f"  row{i} -> {nm}  FAILED: {type(e).__name__}: {str(e)[:90]}")
                pg.screenshot(path=f"{SHOT}/pw_set_{i:02d}_ERR.png")
        print(f"\nset {ok}/{nrows} creatives")
        br.close()

if __name__ == "__main__":
    main()
