#!/usr/bin/env python3
# Delete the junk blank duplicate ads (names contain "Copy"), leaving the 2 real creatives.
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

def copy_rows(pg):
    loc = pg.get_by_text("Copy", exact=False)
    out = []
    for i in range(loc.count()):
        try:
            t = loc.nth(i).inner_text()
            b = loc.nth(i).bounding_box()
            if b and b["x"] < 500 and "Traffic Ad" in t and "Copy" in t:
                out.append((b["y"], loc.nth(i), t.strip()))
        except Exception:
            pass
    out.sort(key=lambda x: x[0])
    return out

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1440,"height":1000},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.goto(AD_URL, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(6500)

    deleted = 0
    for _ in range(8):
        rows = copy_rows(pg)
        if not rows:
            break
        y, row, label = rows[0]
        try:
            row.scroll_into_view_if_needed(); row.click(); pg.wait_for_timeout(2500)
            am = pg.get_by_role("button", name="Action menu")
            am.first.click(); pg.wait_for_timeout(1000)
            dl = pg.get_by_text("Delete", exact=True)
            dl.first.click(); pg.wait_for_timeout(1500)
            # confirm dialog
            for lbl in ("Delete", "Confirm", "Delete ad", "Remove"):
                b = pg.get_by_role("button", name=lbl, exact=True)
                if b.count() and b.last.is_visible():
                    try:
                        b.last.click(); pg.wait_for_timeout(2500); break
                    except Exception:
                        pass
            print(f"deleted: {label}")
            deleted += 1
            pg.wait_for_timeout(1500)
        except Exception as e:
            print(f"delete failed on {label}: {type(e).__name__}: {str(e)[:80]}")
            pg.screenshot(path=f"{SHOT}/pw_del_ERR.png")
            break

    print(f"\ntotal deleted: {deleted}")
    # remaining rows
    rem = pg.get_by_text("New Traffic Ad", exact=False)
    cnt = 0
    for i in range(rem.count()):
        try:
            b = rem.nth(i).bounding_box()
            if b and b["x"] < 500: cnt += 1
        except Exception: pass
    print("remaining ad rows:", cnt)
    pg.screenshot(path=f"{SHOT}/pw_after_cleanup.png")
    br.close()
