#!/usr/bin/env python3
# Identify the blank (no-media) draft ad and delete it, keeping the ad-afterhours anchor.
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

    n = len(rows(pg)); print("rows:", n)
    blank_idx = None
    for i in range(n):
        rr = rows(pg); rr[i].scroll_into_view_if_needed(); rr[i].click(); pg.wait_for_timeout(3200)
        rm = pg.get_by_text("Remove media", exact=False).count()
        print(f"  ad{i} has_media={rm>0}")
        if rm == 0 and blank_idx is None:
            blank_idx = i
    if blank_idx is None:
        print("no blank ad found — nothing to delete"); br.close(); raise SystemExit

    # select the blank row and delete it
    rr = rows(pg); rr[blank_idx].scroll_into_view_if_needed(); rr[blank_idx].click(); pg.wait_for_timeout(3000)
    am = pg.get_by_role("button", name="Action menu"); am.first.click(); pg.wait_for_timeout(1000)
    pg.get_by_text("Delete", exact=True).first.click(); pg.wait_for_timeout(1500)
    for lbl in ("Delete", "Confirm", "Delete ad", "Remove"):
        b = pg.get_by_role("button", name=lbl, exact=True)
        if b.count() and b.last.is_visible():
            try: b.last.click(); pg.wait_for_timeout(2500); break
            except Exception: pass
    print(f"deleted blank ad{blank_idx}")
    pg.wait_for_timeout(1500)
    print("rows now:", len(rows(pg)))
    pg.screenshot(path=f"{SHOT}/pw_final_state.png")
    br.close()
