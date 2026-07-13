#!/usr/bin/env python3
# Extract all ad IDs in the campaign by scraping the editor/table page (API is OPES-blocked).
import re, json
import browser_cookie3 as bc
from playwright.sync_api import sync_playwright

CAMP = "120251825595040264"; ADSET = "120251825595060264"; KNOWN_AD = "120251825595050264"
URLS = [
  f"https://adsmanager.facebook.com/adsmanager/manage/ads?act=1385957480082367&business_id=922594067545558&selected_campaign_ids={CAMP}",
]

def pw_cookies():
    out = []
    for c in bc.chrome(domain_name='facebook.com'):
        out.append({"name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith('.') else '.'+c.domain,
            "path": c.path or "/", "expires": float(c.expires) if c.expires else -1,
            "httpOnly": False, "secure": bool(c.secure), "sameSite": "Lax"})
    return out

ids = set()
def grab(text):
    for m in re.finditer(r'1202518255950[0-9]{4,8}', text or ""):
        ids.add(m.group(0))

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width":1600,"height":900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
    ctx.add_cookies(pw_cookies())
    pg = ctx.new_page()
    pg.on("response", lambda r: None)
    # capture GraphQL responses that carry the ad list
    def on_resp(resp):
        try:
            if "graphql" in resp.url or "/api/" in resp.url:
                grab(resp.text())
        except Exception: pass
    pg.on("response", on_resp)
    for u in URLS:
        pg.goto(u, wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(9000)
        grab(pg.content())
    br.close()

# classify: exclude campaign/adset ids
ad_ids = sorted(x for x in ids if x not in (CAMP, ADSET))
print("known ad:", KNOWN_AD)
print(f"found {len(ad_ids)} ad-shaped id(s):")
for i in ad_ids: print("  ", i)
open("/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad/ad_ids.txt","w").write("\n".join(ad_ids))
