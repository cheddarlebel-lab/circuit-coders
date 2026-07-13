#!/usr/bin/env python3
# Uploads CC creatives to Meta by driving a scriptable browser that reuses Leo's logged-in
# Chrome session (cookies) and uploads files natively (setInputFiles) — bypasses the dialog wall.
import sys, glob, os, time
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
        ss = "Lax"
        out.append({
            "name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/",
            "expires": float(c.expires) if c.expires else -1,
            "httpOnly": bool(c._rest.get('HttpOnly', False)) if hasattr(c, '_rest') else False,
            "secure": bool(c.secure), "sameSite": ss,
        })
    return out

def main():
    cookies = pw_cookies()
    print(f"loaded {len(cookies)} cookies")
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True)
        ctx = br.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent=("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"),
        )
        ctx.add_cookies(cookies)
        pg = ctx.new_page()
        pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(6000)
        pg.screenshot(path=f"{SHOT}/pw01_loaded.png")
        print("URL:", pg.url, "| logged in:", "publish" in pg.inner_text("body").lower())

        photos = sorted(glob.glob(os.path.expanduser(
            "~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS/*.png")))
        print(f"{len(photos)} photos to upload")

        # open the Media 'Edit' dropdown -> 'Edit media' (try each Edit button until the menu shows it)
        opened = False
        edits = pg.get_by_role("button", name="Edit")
        for i in range(edits.count()):
            try:
                edits.nth(i).scroll_into_view_if_needed(); edits.nth(i).click(); pg.wait_for_timeout(700)
                em = pg.get_by_text("Edit media", exact=True)
                if em.count() > 0:
                    em.first.click(); opened = True; break
                pg.keyboard.press("Escape")
            except Exception as e:
                pg.keyboard.press("Escape")
        print("media picker opened:", opened)
        pg.wait_for_timeout(3000)
        pg.screenshot(path=f"{SHOT}/pw02_picker.png")

        # click + Upload and feed the files to the native chooser
        try:
            with pg.expect_file_chooser(timeout=15000) as fc:
                pg.get_by_role("button", name="Upload").first.click()
            fc.value.set_files(photos)
            print("set_files OK — uploading…")
        except Exception as e:
            print("file-chooser upload FAILED:", type(e).__name__, str(e)[:160])
        pg.wait_for_timeout(20000)  # let Meta process the uploads
        pg.screenshot(path=f"{SHOT}/pw03_uploaded.png")
        # count how many media tiles are now visible in the picker
        tiles = pg.locator("[role=dialog] img, [aria-modal] img").count()
        print("media tiles in picker after upload:", tiles)
        pg.wait_for_timeout(1500)
        br.close()

if __name__ == "__main__":
    main()
