#!/usr/bin/env python3
"""
Circuit Coders — Meta Marketing API automation.
Uploads creatives (image bytes + video files) directly over HTTP and builds ads
programmatically. Bypasses the browser file-upload wall entirely.

SETUP (one time):
  1. Get a token with `ads_management` (see the walkthrough Leo was given).
  2. Save it:  echo 'META_TOKEN=<token>' > ~/clawd/circuit-coders/.secrets/meta.env
               chmod 600 ~/clawd/circuit-coders/.secrets/meta.env
RUN:
  python3 meta_ads_api.py                # upload all photos -> one dynamic-creative ad (PAUSED)
  python3 meta_ads_api.py --videos       # also upload the 3 videos as paused video ads
  python3 meta_ads_api.py --check        # just verify token + show account/page/adset
Everything is created PAUSED — nothing spends until you flip it on in Ads Manager.
"""
import os, sys, json, glob, subprocess, mimetypes
import requests

API   = "https://graph.facebook.com/v21.0"
ACT   = "act_1385957480082367"
ADSET = "120251825595060264"                      # existing "Auto shops — SoCal" ad set
LINK  = "https://www.circuitcoders.com/start?utm_source=meta&utm_medium=cpc&utm_campaign=auto-jul"
PHOTOS = os.path.expanduser("~/clawd/circuit-coders/content-engine/out/CAMPAIGN-PHOTOS")
VIDEOS = [os.path.expanduser(f"~/clawd/circuit-coders/content-engine/out/videos/{n}.mp4")
          for n in ("hero", "websites", "local")]
PRIMARY = ("Every call you miss is a job walking to the shop down the street. We give local "
           "businesses a 24/7 AI receptionist, a site that ranks, and a Google profile that "
           "shows up. Free audit, no obligation — hear the AI answer a real call: (760) 546-9189.")
HEADLINES = ["Stop losing jobs to voicemail", "Never miss a call again", "Get found on Google"]
DESCRIPTIONS = ["Free shop audit + live AI demo", "Custom sites, SEO, AI receptionist"]

def token():
    t = os.environ.get("META_TOKEN")
    if not t:
        p = os.path.expanduser("~/clawd/circuit-coders/.secrets/meta.env")
        if os.path.exists(p):
            t = open(p).read().split("=", 1)[1].strip().strip('"')
    if not t:
        sys.exit("No token. Put META_TOKEN in ~/clawd/circuit-coders/.secrets/meta.env")
    return t
TOKEN = token()

def api(method, path, data=None, files=None):
    data = dict(data or {}); data["access_token"] = TOKEN
    r = getattr(requests, method)(f"{API}/{path}", data=data, files=files)
    j = r.json()
    if isinstance(j, dict) and j.get("error"):
        sys.exit(f"\nAPI ERROR on {method.upper()} {path}:\n  {json.dumps(j['error'], indent=2)}")
    return j

def discover():
    me = api("get", "me/accounts", data={"fields": "name,id,instagram_business_account"})
    pages = me.get("data", [])
    if os.environ.get("PAGE_ID"):
        pid = os.environ["PAGE_ID"]; ig = None
        for p in pages:
            if p["id"] == pid: ig = (p.get("instagram_business_account") or {}).get("id")
    else:
        pref = [p for p in pages if "circuit" in p["name"].lower()] or pages
        if not pref: sys.exit("No Facebook Page found on this token. Set PAGE_ID=<id>.")
        pid = pref[0]["id"]; ig = (pref[0].get("instagram_business_account") or {}).get("id")
    return pid, ig

def upload_image(path):
    fn = os.path.basename(path)
    with open(path, "rb") as f:
        j = api("post", f"{ACT}/adimages", files={fn: (fn, f, "image/png")})
    return j["images"][fn]["hash"]

def upload_video(path):
    fn = os.path.basename(path)
    with open(path, "rb") as f:
        j = api("post", f"{ACT}/advideos", data={"name": fn}, files={"source": (fn, f, "video/mp4")})
    return j["id"]

def video_thumb_hash(path):
    tmp = f"/tmp/thumb_{os.path.basename(path)}.png"
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss","16","-i",path,"-frames:v","1",tmp], check=True)
    return upload_image(tmp)

def create_dynamic_image_ad(page_id, ig_id, hashes):
    afs = {
        "images": [{"hash": h} for h in hashes],
        "bodies": [{"text": PRIMARY}],
        "titles": [{"text": t} for t in HEADLINES],
        "descriptions": [{"text": d} for d in DESCRIPTIONS],
        "link_urls": [{"website_url": LINK}],
        "call_to_action_types": ["LEARN_MORE"],
        "ad_formats": ["SINGLE_IMAGE"],
    }
    oss = {"page_id": page_id}
    if ig_id: oss["instagram_actor_id"] = ig_id
    cr = api("post", f"{ACT}/adcreatives", data={
        "name": "CC — all-photos dynamic", "object_story_spec": json.dumps(oss),
        "asset_feed_spec": json.dumps(afs), "degrees_of_freedom_spec": json.dumps(
            {"creative_features_spec": {"standard_enhancements": {"enroll_status": "OPT_OUT"}}}),
    })
    ad = api("post", f"{ACT}/ads", data={
        "name": "CC — All photos (dynamic)", "adset_id": ADSET,
        "creative": json.dumps({"creative_id": cr["id"]}), "status": "PAUSED"})
    return ad["id"]

def create_video_ad(page_id, ig_id, video_id, thumb_hash, headline):
    vd = {"video_id": video_id, "image_hash": thumb_hash, "message": PRIMARY, "title": headline,
          "call_to_action": {"type": "LEARN_MORE", "value": {"link": LINK}}}
    oss = {"page_id": page_id, "video_data": vd}
    if ig_id: oss["instagram_actor_id"] = ig_id
    cr = api("post", f"{ACT}/adcreatives", data={"name": f"CC vid {headline}", "object_story_spec": json.dumps(oss)})
    ad = api("post", f"{ACT}/ads", data={"name": f"CC — {headline} (video)", "adset_id": ADSET,
             "creative": json.dumps({"creative_id": cr["id"]}), "status": "PAUSED"})
    return ad["id"]

def main():
    args = sys.argv[1:]
    page_id, ig_id = discover()
    print(f"✓ token OK · account {ACT} · page {page_id} · ig {ig_id or '—'} · adset {ADSET}")
    if "--check" in args: return
    imgs = sorted(glob.glob(f"{PHOTOS}/*.png"))
    print(f"Uploading {len(imgs)} images…")
    hashes = []
    for p in imgs:
        hashes.append(upload_image(p)); print(f"  ✓ {os.path.basename(p)}")
    ad_id = create_dynamic_image_ad(page_id, ig_id, hashes)
    print(f"✅ dynamic image ad (all {len(hashes)} photos, PAUSED): {ad_id}")
    if "--videos" in args:
        for path, hl in zip(VIDEOS, ["Hear the AI answer","Websites that rank","Get in the top 3"]):
            if not os.path.exists(path): continue
            print(f"Uploading video {os.path.basename(path)}…")
            vid = upload_video(path); th = video_thumb_hash(path)
            vad = create_video_ad(page_id, ig_id, vid, th, hl)
            print(f"  ✅ video ad (PAUSED): {vad}")
    print(f"\nReview + turn on: https://adsmanager.facebook.com/adsmanager/manage/ads?act={ACT.split('_')[1]}")

if __name__ == "__main__":
    main()
