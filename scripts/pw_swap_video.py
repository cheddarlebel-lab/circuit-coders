#!/usr/bin/env python3
# Swap the live ad's creative from the static image to demo.mp4:
# open ad editor -> Edit media -> Upload the video -> select it -> walk wizard -> Publish.
import os, sys
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
VIDEO = os.path.expanduser("~/clawd/circuit-coders/content-engine/out/videos/demo.mp4")
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

def open_edit_media(pg):
    edits = pg.get_by_role("button", name="Edit")
    for i in range(min(edits.count(), 8)):
        try:
            edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(700)
            em = pg.get_by_text("Edit media", exact=True)
            if em.count():
                em.first.click(); pg.wait_for_timeout(1500)
                # "customizations will be removed" -> Continue
                cont = pg.get_by_role("button", name="Continue", exact=True)
                if cont.count() and cont.first.is_visible():
                    cont.first.click(); pg.wait_for_timeout(2000)
                if pg.get_by_placeholder("Search media").count():
                    return True
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    return False

def main():
    print("video exists:", os.path.exists(VIDEO), VIDEO)
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(viewport={"width":1440,"height":1000},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        ctx.add_cookies(pw_cookies())
        pg = ctx.new_page()
        pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(6500)

        # Published ad → the standalone edit URL lands on the ads table. Open the editor via toolbar Edit.
        if pg.get_by_text("Ad creative", exact=False).count() == 0:
            try:
                # make sure the ad row is selected, then click the toolbar Edit
                cb = pg.locator("tr input[type=checkbox], [role=row] input[type=checkbox]")
                ed = pg.get_by_role("button", name="Edit", exact=True)
                if ed.count():
                    ed.first.click(); pg.wait_for_timeout(6500)
                    print("opened editor via Edit button; has Ad creative:",
                          pg.get_by_text("Ad creative", exact=False).count() > 0)
            except Exception as e:
                print("edit-open err:", type(e).__name__, str(e)[:100])

        if not open_edit_media(pg):
            print("FAIL: could not open media picker"); pg.screenshot(path=f"{SHOT}/pw_swap_ERR1.png"); br.close(); return
        print("picker open")
        pg.screenshot(path=f"{SHOT}/pw_swap_picker.png")

        # Upload the video via the native file chooser
        try:
            with pg.expect_file_chooser(timeout=15000) as fc:
                pg.get_by_role("button", name="Upload").first.click()
            fc.value.set_files([VIDEO])
            print("set_files OK — uploading video…")
        except Exception as e:
            print("UPLOAD FAILED:", type(e).__name__, str(e)[:150]); pg.screenshot(path=f"{SHOT}/pw_swap_ERR2.png"); br.close(); return

        # let Meta ingest + process the video (poll up to ~90s for it to become selectable)
        selected = False
        for attempt in range(9):
            pg.wait_for_timeout(10000)
            try:
                box = pg.get_by_placeholder("Search media")
                if box.count():
                    box.click(); box.fill(""); box.fill("demo"); pg.wait_for_timeout(2500)
                # try to click the first video/result tile
                tile = None
                for anchor in ("Account videos", "Account images", "Media from you"):
                    el = pg.get_by_text(anchor, exact=False)
                    if el.count():
                        cand = el.first.locator("xpath=following::img[1]")
                        if cand.count():
                            tile = cand; break
                if tile is None:
                    tile = pg.locator("img[src*='fbcdn']").first
                tile.wait_for(state="visible", timeout=6000)
                tile.click(); pg.wait_for_timeout(1500)
                selected = True
                print(f"video selected (attempt {attempt+1})")
                break
            except Exception as e:
                print(f"  waiting for video to process… ({attempt+1}) {type(e).__name__}")
        if not selected:
            print("FAIL: video not selectable"); pg.screenshot(path=f"{SHOT}/pw_swap_ERR3.png"); br.close(); return

        # walk the creative wizard (Media->Crop->Text->... ) until it closes
        for _ in range(14):
            if pg.get_by_text("Set up your creative").count() == 0:
                break
            clicked = False
            for label in ("Next", "Save and continue", "Done", "Apply", "Save"):
                b = pg.get_by_role("button", name=label, exact=True)
                if b.count() and b.first.is_visible() and b.first.is_enabled():
                    try: b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1800); break
                    except Exception: continue
            if not clicked: break
        pg.wait_for_timeout(2000)
        pg.screenshot(path=f"{SHOT}/pw_swap_applied.png")

        # Publish the change on the live ad
        pub = None
        for lbl in ("Publish", "Preview to publish"):
            b = pg.get_by_role("button", name=lbl, exact=True)
            if b.count() and b.first.is_visible() and b.first.is_enabled():
                pub = b.first; break
        if pub:
            pub.click(); pg.wait_for_timeout(3500)
            # a confirm "Publish" may appear
            for lbl in ("Publish", "Confirm"):
                b = pg.get_by_role("button", name=lbl, exact=True)
                if b.count() and b.last.is_visible():
                    try: b.last.click(); pg.wait_for_timeout(3000); break
                    except Exception: pass
            print("published")
        else:
            print("NOTE: no publish button found — draft saved, may need manual publish")
        pg.wait_for_timeout(2000)
        # report media state
        rm = pg.get_by_text("Remove media", exact=False).count()
        body = pg.inner_text("body").lower()
        print("has_media:", rm > 0, "| 'video' in body:", "video" in body)
        pg.screenshot(path=f"{SHOT}/pw_swap_final.png", full_page=True)
        br.close()

if __name__ == "__main__":
    main()
