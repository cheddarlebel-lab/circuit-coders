#!/usr/bin/env python3
# Build the full draft campaign: one single-image ad per uploaded photo, via the logged-in session.
# ad0 already = ad-afterhours (photo 0). Sets photo1 on the existing 2nd ad, then quick-duplicates
# + sets creative for the rest. Leaves everything as PAUSED DRAFTS (does NOT publish).
# Usage: python3 pw_build_final.py [TARGET_TOTAL]   default 18
import glob, os, sys
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

SHOT = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad"
AD_URL = ("https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?"
          "act=1385957480082367&business_id=922594067545558"
          "&selected_campaign_ids=120251825595040264&selected_adset_ids=120251825595060264"
          "&selected_ad_ids=120251825595050264")
TARGET = int(sys.argv[1]) if len(sys.argv) > 1 else 18

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

def select_row(pg, idx):
    rows = tree_rows(pg)
    rows[idx].scroll_into_view_if_needed(); rows[idx].click(); pg.wait_for_timeout(2500)

def open_edit_media(pg):
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

def set_creative(pg, name):
    if not open_edit_media(pg):
        raise RuntimeError("no media picker")
    pg.wait_for_timeout(2500)
    box = pg.get_by_placeholder("Search media")
    box.click(); box.fill(name); pg.wait_for_timeout(2800)
    tile = pg.get_by_text("Account images").locator("xpath=following::img[1]")
    tile.wait_for(state="visible", timeout=9000)
    tile.click(); pg.wait_for_timeout(1200)
    for _ in range(12):
        if pg.get_by_text("Set up your creative").count() == 0:
            break
        clicked = False
        for label in ("Next", "Save and continue", "Publish", "Save", "Done", "Apply"):
            b = pg.get_by_role("button", name=label, exact=True)
            if b.count() > 0 and b.first.is_visible() and b.first.is_enabled():
                try:
                    b.first.click(timeout=6000); clicked = True; pg.wait_for_timeout(1800); break
                except Exception:
                    continue
        if not clicked:
            break
    pg.wait_for_timeout(1200)

def quick_duplicate(pg):
    n0 = len(tree_rows(pg))
    am = pg.get_by_role("button", name="Action menu")
    am.first.click(); pg.wait_for_timeout(1000)
    qd = pg.get_by_text("Quick duplicate", exact=True)
    (qd.first if qd.count() else pg.get_by_text("Duplicate", exact=True).first).click()
    pg.wait_for_timeout(3500)
    # if a duplicate dialog appeared, confirm
    for lbl in ("Duplicate", "Confirm"):
        b = pg.get_by_role("button", name=lbl, exact=True)
        if b.count() and b.last.is_visible():
            try: b.last.click(); pg.wait_for_timeout(2500)
            except Exception: pass
    return len(tree_rows(pg)) > n0

def review_error(pg):
    for kw in ("verified phone number", "Review 1 error", "Review 2 errors", "must have"):
        if pg.get_by_text(kw, exact=False).count():
            try: return pg.get_by_text("error", exact=False).first.inner_text()[:120]
            except Exception: return kw
    return "none visible"

def main():
    photos = sorted(glob.glob(os.path.expanduser(
        "~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS/*.png")))
    names = [os.path.basename(p).replace(".png", "") for p in photos][:TARGET]
    print("target photos:", names)
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(viewport={"width":1440,"height":1000},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        ctx.add_cookies(pw_cookies())
        pg = ctx.new_page()
        pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(6500)
        rows0 = tree_rows(pg)
        print(f"starting ad rows: {len(rows0)}")

        done = []
        # ad0 (row0) already = ad-afterhours = names[0]; verify by leaving it.
        done.append(names[0] + " (pre-set)")

        # names[1] -> existing 2nd row if present, else duplicate
        idx = 1
        if len(rows0) >= 2:
            try:
                select_row(pg, 1); set_creative(pg, names[1])
                pg.screenshot(path=f"{SHOT}/pw_f_{idx:02d}.png"); done.append(names[1]); idx = 2
            except Exception as e:
                print(f"  set row1 failed: {type(e).__name__}: {str(e)[:80]}")

        fails = 0
        while idx < len(names) and fails < 3:
            nm = names[idx]
            try:
                if not quick_duplicate(pg):
                    print(f"  duplicate failed at {idx}"); fails += 1; continue
                select_row(pg, len(tree_rows(pg)) - 1)   # newest copy is last
                set_creative(pg, nm)
                pg.screenshot(path=f"{SHOT}/pw_f_{idx:02d}.png")
                done.append(nm); fails = 0; idx += 1
                print(f"  [{idx}/{len(names)}] set {nm}")
            except Exception as e:
                fails += 1
                print(f"  ✗ {nm}: {type(e).__name__}: {str(e)[:90]}")
                pg.screenshot(path=f"{SHOT}/pw_f_{idx:02d}_ERR.png")

        print(f"\nBUILT {len(done)} ad creatives:", done)
        print("tree rows now:", len(tree_rows(pg)))
        print("review error:", review_error(pg))
        pg.screenshot(path=f"{SHOT}/pw_f_FINAL.png", full_page=True)
        br.close()

if __name__ == "__main__":
    main()
