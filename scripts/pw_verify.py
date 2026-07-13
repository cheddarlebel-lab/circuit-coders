#!/usr/bin/env python3
# Verify both remaining draft ads have creatives + capture the exact review-error text.
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
    n = len(rows(pg)); print("ad rows:", n)
    for i in range(n):
        rr = rows(pg)
        rr[i].scroll_into_view_if_needed(); rr[i].click(); pg.wait_for_timeout(3500)
        body = pg.inner_text("body")
        err = "verified phone number" in body
        rev = "Review 1 error" in body or "Review 2 errors" in body or "error" in body.lower()
        # try to read the exact review banner
        banner = ""
        for kw in ("You must have a verified phone number", "must have", "Review 1 error", "Review 2 errors"):
            el = pg.get_by_text(kw, exact=False)
            if el.count():
                try: banner = el.first.inner_text()[:100]; break
                except Exception: pass
        print(f"  ad{i}: phone_err={err} | banner={banner!r}")
        pg.screenshot(path=f"{SHOT}/pw_verify_{i}.png")
    br.close()
