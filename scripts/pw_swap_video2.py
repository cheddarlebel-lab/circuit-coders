#!/usr/bin/env python3
# Swap the live ad to demo.mp4 (v2): pause -> open editor via table Edit (robust) ->
# Edit media -> Upload video -> select -> wizard -> Publish -> unpause.
import os
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
VIDEO = os.path.expanduser("~/clawd/circuit-coders/content-engine/out/videos/demo.mp4")
TABLE = ("https://adsmanager.facebook.com/adsmanager/manage/ads?act=1385957480082367"
         "&business_id=922594067545558&selected_campaign_ids=120251825595040264")

def pw_cookies():
    out = []
    for c in bc.chrome(domain_name='facebook.com'):
        out.append({"name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/", "expires": float(c.expires) if c.expires else -1,
            "httpOnly": False, "secure": bool(c.secure), "sameSite": "Lax"})
    return out

def in_editor(pg):
    return pg.get_by_text("Ad name", exact=True).count() > 0 or \
           pg.get_by_role("button", name="Preview to publish", exact=True).count() > 0

def open_editor(pg):
    pg.goto(TABLE, wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(6000)
    # select the ad row checkbox
    try:
        cbs = pg.locator("[role=row] input[type=checkbox], tr input[type=checkbox]")
        for i in range(cbs.count()):
            try:
                if cbs.nth(i).is_visible():
                    cbs.nth(i).check(); break
            except Exception: pass
    except Exception: pass
    pg.wait_for_timeout(1000)
    # click the toolbar Edit
    ed = pg.get_by_role("button", name="Edit", exact=True)
    if ed.count():
        ed.first.click()
    for _ in range(10):
        pg.wait_for_timeout(1500)
        if in_editor(pg): return True
    return False

def set_toggle(pg, on):
    """Flip the ad's on/off switch in the table to desired state."""
    pg.goto(TABLE, wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(5000)
    sw = pg.get_by_role("switch")
    if sw.count():
        try:
            checked = sw.first.get_attribute("aria-checked")
            want = "true" if on else "false"
            if checked != want:
                sw.first.click(); pg.wait_for_timeout(2500)
                # confirm dialog (turn off publishes a change)
                for lbl in ("Turn off", "Turn on", "Confirm", "Publish"):
                    b = pg.get_by_role("button", name=lbl, exact=True)
                    if b.count() and b.last.is_visible():
                        try: b.last.click(); pg.wait_for_timeout(2500); break
                        except Exception: pass
            print(f"toggle -> {'ON' if on else 'OFF'} (was {checked})")
        except Exception as e:
            print("toggle err", type(e).__name__, str(e)[:80])

def open_edit_media(pg):
    edits = pg.get_by_role("button", name="Edit")
    for i in range(min(edits.count(), 10)):
        try:
            edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(700)
            em = pg.get_by_text("Edit media", exact=True)
            if em.count():
                em.first.click(); pg.wait_for_timeout(1500)
                cont = pg.get_by_role("button", name="Continue", exact=True)
                if cont.count() and cont.first.is_visible():
                    cont.first.click(); pg.wait_for_timeout(2000)
                if pg.get_by_placeholder("Search media").count(): return True
            pg.keyboard.press("Escape")
        except Exception:
            pg.keyboard.press("Escape")
    return False

def main():
    print("video:", os.path.exists(VIDEO))
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(viewport={"width":1440,"height":1000},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        ctx.add_cookies(pw_cookies())
        pg = ctx.new_page()

        set_toggle(pg, on=False)                       # pause during edit
        if not open_editor(pg):
            print("FAIL: editor did not open"); pg.screenshot(path=f"{SHOT}/pw_swap2_ERR_editor.png")
            set_toggle(pg, on=True); br.close(); return
        print("editor open")

        if not open_edit_media(pg):
            print("FAIL: media picker"); pg.screenshot(path=f"{SHOT}/pw_swap2_ERR_pick.png")
            set_toggle(pg, on=True); br.close(); return
        print("picker open")

        try:
            with pg.expect_file_chooser(timeout=15000) as fc:
                pg.get_by_role("button", name="Upload").first.click()
            fc.value.set_files([VIDEO]); print("uploading video…")
        except Exception as e:
            print("UPLOAD FAIL:", type(e).__name__, str(e)[:120]); pg.screenshot(path=f"{SHOT}/pw_swap2_ERR_upload.png")
            set_toggle(pg, on=True); br.close(); return

        selected = False
        for a in range(9):
            pg.wait_for_timeout(10000)
            try:
                box = pg.get_by_placeholder("Search media")
                if box.count(): box.click(); box.fill(""); box.fill("demo"); pg.wait_for_timeout(2500)
                tile = None
                for anc in ("Account videos", "Videos", "Media from you", "Account images"):
                    el = pg.get_by_text(anc, exact=False)
                    if el.count():
                        c = el.first.locator("xpath=following::img[1]")
                        if c.count(): tile = c; break
                if tile is None: tile = pg.locator("img[src*='fbcdn']").first
                tile.wait_for(state="visible", timeout=6000); tile.click(); pg.wait_for_timeout(1500)
                selected = True; print(f"video selected ({a+1})"); break
            except Exception:
                print(f"  processing… {a+1}")
        if not selected:
            print("FAIL: video not selectable"); pg.screenshot(path=f"{SHOT}/pw_swap2_ERR_sel.png")
            set_toggle(pg, on=True); br.close(); return

        for _ in range(14):
            if pg.get_by_text("Set up your creative").count() == 0: break
            clicked = False
            for label in ("Next", "Save and continue", "Done", "Apply", "Save"):
                b = pg.get_by_role("button", name=label, exact=True)
                if b.count() and b.first.is_visible() and b.first.is_enabled():
                    try: b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1800); break
                    except Exception: continue
            if not clicked: break
        pg.wait_for_timeout(2000); pg.screenshot(path=f"{SHOT}/pw_swap2_applied.png")

        for lbl in ("Publish", "Preview to publish"):
            b = pg.get_by_role("button", name=lbl, exact=True)
            if b.count() and b.first.is_visible() and b.first.is_enabled():
                b.first.click(); pg.wait_for_timeout(3500)
                for l2 in ("Publish", "Confirm"):
                    bb = pg.get_by_role("button", name=l2, exact=True)
                    if bb.count() and bb.last.is_visible():
                        try: bb.last.click(); pg.wait_for_timeout(3000); break
                        except Exception: pass
                print("published"); break
        rm = pg.get_by_text("Remove media", exact=False).count()
        print("has_media after:", rm > 0)
        pg.screenshot(path=f"{SHOT}/pw_swap2_final.png", full_page=True)

        set_toggle(pg, on=True)                        # resume delivery
        print("DONE — ad re-enabled")
        br.close()

if __name__ == "__main__":
    main()
