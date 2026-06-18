#!/usr/bin/env python3
"""review-gen kit generator — QR cards + short-link routing.

Builds a per-store QR code that points at the review destination, with store routing:
  Toyota -> Google (where it's strong, keep it compounding)
  Kia    -> rotates CARFAX / Yelp / Google to fill its WEAK platforms (CARFAX shows
            0 reviews despite a Lifetime Dealer badge; Yelp 2.5/52 is the worst surface)

Reads review links from ../machine/config/stores.json (the 'review_link' per platform).
Fill those with real g.page/r and CARFAX/Yelp review URLs at kickoff, then re-run.

Run: python3 gen_cards.py
Output: cards/*.png (QR codes) + print/review-cards.html (4-up print sheet)
"""
import json
import sys
from pathlib import Path

try:
    import qrcode
except ImportError:
    print("pip install qrcode[pil] — or generate via api.qrserver.com fallback")
    sys.exit(1)

HERE = Path(__file__).resolve().parent
CONFIG = HERE.parent / "machine" / "config" / "stores.json"
CARDS = HERE / "cards"
PRINT = HERE / "print"

# Per-store routing: which platform each card drives to (fills weak surfaces first)
ROUTING = {
    "toyota": ["google"],
    "kia": ["carfax", "yelp", "google"],
}


def review_url(store, platform):
    p = store["platforms"].get(platform, {})
    link = p.get("review_link") or p.get("url") or ""
    if not link or link.startswith("<FILL"):
        # safe placeholder so the kit builds now; swap for real link at kickoff
        return f"https://REVIEW-LINK-PENDING/{store['key']}/{platform}"
    return link


def make_qr(url, out):
    qr = qrcode.QRCode(box_size=10, border=2, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(out)


def main():
    CARDS.mkdir(exist_ok=True)
    PRINT.mkdir(exist_ok=True)
    with open(CONFIG) as f:
        stores = {s["key"]: s for s in json.load(f)["stores"]}

    cards = []
    for key, platforms in ROUTING.items():
        store = stores[key]
        for platform in platforms:
            url = review_url(store, platform)
            png = CARDS / f"{key}-{platform}.png"
            make_qr(url, png)
            cards.append({"store": store["name"], "key": key, "platform": platform,
                          "url": url, "png": png.name, "color": store["brand_color"]})
            print(f"qr: {png.name} -> {url}")

    # Print sheet — restrained, content-forward (design-taste rule): white card, store
    # color as a thin top rule only, real instruction copy, no gradients/glyph clutter.
    cells = []
    for c in cards:
        pending = "REVIEW-LINK-PENDING" in c["url"]
        warn = ' <span style="color:#b00">[link pending — set at kickoff]</span>' if pending else ""
        cells.append(f'''
    <div class="card">
      <div class="rule" style="background:{c['color']}"></div>
      <div class="store">{c['store']}</div>
      <div class="ask">Was your visit a good one?</div>
      <img src="../cards/{c['png']}" alt="QR to {c['platform']} review"/>
      <div class="cta">Scan to leave a quick review on {c['platform'].title()}{warn}</div>
      <div class="thanks">It takes 30 seconds and it genuinely helps our team.</div>
    </div>''')

    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
    @page {{ size: letter; margin: 0.4in; }}
    body {{ font-family: -apple-system, Helvetica, Arial, sans-serif; margin:0; }}
    .grid {{ display:grid; grid-template-columns:1fr 1fr; gap:0.3in; }}
    .card {{ border:1px solid #e2e2e2; border-radius:10px; padding:22px; text-align:center;
             page-break-inside:avoid; }}
    .rule {{ height:5px; border-radius:3px; margin:-6px -6px 16px; }}
    .store {{ font-weight:700; font-size:17px; letter-spacing:.2px; }}
    .ask {{ color:#444; margin:6px 0 14px; font-size:13px; }}
    .card img {{ width:170px; height:170px; }}
    .cta {{ font-weight:600; font-size:13px; margin-top:12px; }}
    .thanks {{ color:#777; font-size:11px; margin-top:6px; }}
    </style></head><body><div class="grid">{''.join(cells)}</div></body></html>'''
    (PRINT / "review-cards.html").write_text(html)
    print(f"\nprint sheet: {PRINT/'review-cards.html'}")
    print("render to PDF: DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 -m weasyprint "
          f"{PRINT/'review-cards.html'} {PRINT/'review-cards.pdf'}")


if __name__ == "__main__":
    main()
