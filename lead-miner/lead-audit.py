#!/usr/bin/env python3
"""Lead audit + scoring engine for Maps-mined raw listings.

Input:  raw-*.json  ({query, items: [[name, website_host, phone, rating, reviews, sponsored]]})
Output: mined-leads.jsonl (all scored) + LEADS-<date>.md (ranked digest)

Pipeline: dedupe -> drop already-pitched -> fetch sites -> defect detection ->
email harvest (+contact page) -> MX verify -> score -> rank.
"""
import json, re, ssl, glob, socket, pathlib, datetime, subprocess, urllib.request
from concurrent.futures import ThreadPoolExecutor

HOME = pathlib.Path.home()
DIR = HOME / "clawd/circuit-coders/lead-miner"
OUTREACH = HOME / "clawd/circuit-coders/outreach-log"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
CHEAP_TLDS = (".homes", ".lol", ".store", ".site", ".online", ".xyz", ".top", ".icu", ".club", ".live", ".bio")
DIRECTORY_HOSTS = ("facebook.com", "instagram.com", "yelp.com", "angi.com", "thumbtack.com",
                   "houzz.com", "nextdoor.com", "business.site", "yellowpages.com", "linktr.ee",
                   "porch.com", "homeadvisor.com", "bbb.org", "google.com")
FREEMAIL = ("gmail.com", "yahoo.com", "aol.com", "hotmail.com", "outlook.com", "icloud.com")
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
SKIP_EMAIL_SUBSTR = ("example.", "sentry", "wixpress", "@2x", ".png", ".jpg", ".webp", "godaddy", "yourdomain")

def fetch(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read(600_000).decode(errors="replace"), r.geturl()

def has_mx(domain):
    try:
        out = subprocess.run(["dig", "+short", "MX", domain], capture_output=True, text=True, timeout=8).stdout.strip()
        return bool(out)
    except Exception:
        return False

def visible_text(html):
    html = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    return re.sub(r"<[^>]+>", " ", html)

def harvest_emails(html, host):
    emails = set()
    for m in EMAIL_RE.finditer(html):
        e = m.group(0).lower().rstrip(".")
        if any(s in e for s in SKIP_EMAIL_SUBSTR):
            continue
        dom = e.split("@")[1]
        root = ".".join(host.lower().split(".")[-2:])
        if dom in FREEMAIL or root in dom or dom in root:
            emails.add(e)
    return sorted(emails)

def audit_site(host, vertical):
    res = {"host": host, "status": None, "defects": [], "emails": [], "generator": None}
    html = final = None
    for scheme in ("https", "http"):
        try:
            html, final = fetch(f"{scheme}://{host}/")
            res["status"] = "ok" if scheme == "https" else "http-only"
            break
        except Exception as e:
            res["status"] = f"dead ({type(e).__name__})"
    if not html:
        res["defects"].append("SITE DEAD/unreachable")
        return res
    if any(host.lower().endswith(t) for t in CHEAP_TLDS):
        res["defects"].append(f"cheap TLD ({host.split('.')[-1]}) — possible GBP hijack/spam template")
    text = visible_text(html)
    low = html.lower()
    gen = re.search(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)', low)
    if gen:
        res["generator"] = gen.group(1)[:40]
    for marker, label in [("wix.com", "Wix template"), ("godaddy", "GoDaddy builder"),
                          ("spothopper", "SpotHopper template"), ("squarespace", "Squarespace"),
                          ("weebly", "Weebly"), ("zyro", "Zyro/Hostinger builder")]:
        if marker in low:
            res["defects"].append(label)
            break
    if re.search(r"\[\w+_\w+( id=)?[^\]]*\]", text):
        res["defects"].append("WP shortcode rendering as raw text (broken plugin)")
    if low.count("data:image/svg") > 3 or "placeholder" in low[:40000]:
        res["defects"].append("placeholder images on homepage")
    if res["status"] == "http-only":
        res["defects"].append("no HTTPS")
    if "viewport" not in low:
        res["defects"].append("no mobile viewport meta (not mobile-friendly)")
    if vertical in ("roofing", "plumbing", "hvac", "electrician", "landscaping", "painting", "gc"):
        if not re.search(r"(lic\.?\s*#?\s*\d{6,7}|cslb\s*#?\s*\d{6,7}|license\s*#?\s*\d{6,7})", low):
            res["defects"].append("no CSLB/license # on homepage")
    if not re.search(r"(since|est\.?|founded|established)[^.]{0,20}(19|20)\d{2}", low):
        res["defects"].append("no founding year / 'since' anchor")
    if not re.search(r"(google review|reviews?\)|★|stars)", low):
        res["defects"].append("no reviews/social proof embedded")
    emails = harvest_emails(html, host)
    if not emails:
        for path in ("/contact", "/contact-us", "/about"):
            try:
                chtml, _ = fetch(f"https://{host}{path}", timeout=8)
                emails = harvest_emails(chtml, host)
                if emails:
                    break
            except Exception:
                pass
    res["emails"] = [e for e in emails if has_mx(e.split("@")[1])][:3]
    if emails and not res["emails"]:
        res["defects"].append("published email domain has NO MX (their inbox is broken)")
    return res

def vertical_of(query):
    q = query.lower()
    for k in ("roofing", "plumb", "landscap", "detail", "hvac", "electric", "paint"):
        if k in q:
            return {"plumb": "plumbing", "landscap": "landscaping", "detail": "detailing",
                    "electric": "electrician", "paint": "painting"}.get(k, k)
    return "general"

def already_pitched():
    seen = set()
    for f in ("sent.jsonl", "followups.jsonl"):
        p = OUTREACH / f
        if p.exists():
            for line in p.read_text().splitlines():
                if line.strip():
                    r = json.loads(line)
                    seen.add(r.get("prospect", "").lower())
                    if r.get("email"):
                        seen.add(r["email"].split("@")[-1].lower())
                    w = r.get("website", "")
                    if w:
                        seen.add(re.sub(r"^https?://(www\.)?", "", w).split("/")[0].lower())
    return seen

def main():
    pitched = already_pitched()
    raw, seen_keys = [], set()
    for f in sorted(glob.glob(str(DIR / "raw-*.json"))):
        d = json.load(open(f))
        vert = vertical_of(d["query"])
        for name, site, phone, rating, reviews, sponsored in d["items"]:
            key = (name or "").lower() + "|" + (phone or "")
            if key in seen_keys or sponsored:
                continue
            seen_keys.add(key)
            if site and any(dh in site for dh in DIRECTORY_HOSTS):
                site = None  # facebook-page-as-website counts as no real site
            host_root = site.lower().lstrip("www.") if site else None
            if (name or "").lower() in pitched or (host_root and host_root in pitched):
                continue
            raw.append({"name": name, "site": site, "phone": phone, "rating": float(rating) if rating else None,
                        "reviews": int(reviews.replace(",", "")) if reviews else 0, "vertical": vert,
                        "query": d["query"]})
    with_site = [r for r in raw if r["site"]]
    no_site = [r for r in raw if not r["site"]]
    print(f"after dedupe: {len(raw)} ({len(with_site)} with site, {len(no_site)} without)")

    with ThreadPoolExecutor(max_workers=12) as ex:
        audits = list(ex.map(lambda r: audit_site(r["site"], r["vertical"]), with_site))
    for r, a in zip(with_site, audits):
        r["audit"] = a
        score = len(a["defects"]) * 10 + (25 if a["emails"] else 0)
        if any("DEAD" in d for d in a["defects"]):
            score += 25
        if any("cheap TLD" in d for d in a["defects"]):
            score += 20
        if r["rating"] and r["rating"] >= 4.5:
            score += 8
        if 3 <= r["reviews"] <= 150:
            score += 8  # real but small = our buyer
        if a["emails"] and any(e.split("@")[1] in FREEMAIL for e in a["emails"]):
            score += 5  # solo operator signal
        r["score"] = score
        r["bucket"] = "email" if a["emails"] else "call"
    for r in no_site:
        score = 40  # no website at all = top defect
        if r["rating"] and r["rating"] >= 4.5:
            score += 10
        if 3 <= r["reviews"] <= 150:
            score += 10
        if r["reviews"] > 20:
            score += 5  # thriving with zero web presence
        r["score"] = score
        r["audit"] = {"defects": ["NO WEBSITE on Google Maps listing"], "emails": []}
        r["bucket"] = "call"

    leads = sorted(raw, key=lambda r: -r["score"])
    today = datetime.date.today().isoformat()
    with open(DIR / "mined-leads.jsonl", "w") as f:
        for r in leads:
            f.write(json.dumps(r) + "\n")

    md = [f"# Mined Leads — {today}", "",
          f"{len(leads)} net-new leads (deduped vs all prior outreach). Source: Google Maps, 7 queries.", ""]
    md.append("## 🔥 EMAIL-FIREABLE (verified MX, defect hooks ready)\n")
    for r in [x for x in leads if x["bucket"] == "email"][:25]:
        a = r["audit"]
        md.append(f"### {r['name']} — score {r['score']}")
        md.append(f"- {r['vertical']} · {r['rating']}★ ({r['reviews']}) · {r['phone'] or 'no phone'} · {r['site']}")
        md.append(f"- email: {', '.join(a['emails'])}")
        md.append(f"- hooks: {'; '.join(a['defects']) or 'weak site, no glaring defect'}\n")
    md.append("## 📞 CALL / IG LIST (no site or no email — highest-value defect, no inbox)\n")
    for r in [x for x in leads if x["bucket"] == "call"][:25]:
        md.append(f"- **{r['name']}** ({r['vertical']}, {r['rating']}★/{r['reviews']}) {r['phone'] or ''} — "
                  f"{'; '.join(r['audit']['defects'][:3])} [score {r['score']}]")
    (DIR / f"LEADS-{today}.md").write_text("\n".join(md))
    print(f"wrote mined-leads.jsonl + LEADS-{today}.md")
    print(f"email-fireable: {sum(1 for r in leads if r['bucket']=='email')}, call-list: {sum(1 for r in leads if r['bucket']=='call')}")

if __name__ == "__main__":
    main()
