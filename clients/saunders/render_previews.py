#!/usr/bin/env python3
"""Render the Saunders landing pages + content posts to branded preview PDFs.

Strips YAML front-matter and the ```json JSON-LD blocks (those are CMS payload, not
visual content), converts the markdown body to HTML, wraps it in a restrained branded
shell (store color as a thin header rule only — design-taste rule), renders via
WeasyPrint. Front-matter title/meta shown in a small SEO header box so we can eyeball
the title tag + meta description too.
"""
import re
import subprocess
import sys
from pathlib import Path

import markdown

HERE = Path(__file__).resolve().parent
OUT = HERE / "previews"

TOYOTA = "#EB0A1E"
KIA = "#BB162B"


def parse(md_text):
    fm = {}
    body = md_text
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", md_text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip().strip('"')
        body = m.group(2)
    # drop fenced json (JSON-LD) and any html comments
    body = re.sub(r"```json.*?```", "", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    return fm, body.strip()


def color_for(path):
    n = path.name.lower()
    return KIA if "kia" in n else TOYOTA


def render(path):
    fm, body = parse(path.read_text())
    html_body = markdown.markdown(body, extensions=["tables", "fenced_code"])
    color = color_for(path)
    title = fm.get("title", path.stem)
    meta = fm.get("meta_description") or fm.get("meta") or ""
    slug = fm.get("slug", "")
    seo = ""
    if title or meta:
        seo = f'''<div class="seo">
        <div class="seo-label">SEO PREVIEW</div>
        <div class="seo-title">{title}</div>
        <div class="seo-url">{slug}</div>
        <div class="seo-meta">{meta}</div></div>'''
    doc = f'''<!doctype html><html><head><meta charset="utf-8"><style>
    @page {{ size: letter; margin: 0.8in 0.9in; }}
    body {{ font-family: Georgia, 'Times New Roman', serif; color:#1a1a1a; line-height:1.55; font-size:11.5pt; }}
    .rule {{ height:6px; background:{color}; border-radius:3px; margin-bottom:22px; }}
    .seo {{ border:1px solid #ddd; border-left:4px solid {color}; padding:10px 14px; margin-bottom:26px;
            font-family:-apple-system,Helvetica,sans-serif; background:#fafafa; }}
    .seo-label {{ font-size:8pt; letter-spacing:1px; color:#999; }}
    .seo-title {{ color:#1a0dab; font-size:12pt; margin:3px 0; }}
    .seo-url {{ color:#0a7d33; font-size:9pt; }}
    .seo-meta {{ color:#444; font-size:9.5pt; margin-top:3px; }}
    h1 {{ font-size:21pt; line-height:1.2; color:#111; }}
    h2 {{ font-size:15pt; color:{color}; margin-top:24px; border-bottom:1px solid #eee; padding-bottom:4px; }}
    h3 {{ font-size:12.5pt; }}
    table {{ border-collapse:collapse; width:100%; margin:14px 0; font-size:10.5pt; }}
    th,td {{ border:1px solid #ddd; padding:7px 10px; text-align:left; }}
    th {{ background:#f5f5f5; }}
    a {{ color:{color}; text-decoration:none; }}
    strong {{ color:#000; }}
    </style></head><body><div class="rule"></div>{seo}{html_body}</body></html>'''
    OUT.mkdir(exist_ok=True)
    html_path = OUT / (path.stem + ".html")
    pdf_path = OUT / (path.stem + ".pdf")
    html_path.write_text(doc)
    subprocess.run(
        ["python3", "-m", "weasyprint", str(html_path), str(pdf_path)],
        env={**__import__("os").environ, "DYLD_FALLBACK_LIBRARY_PATH": "/opt/homebrew/lib"},
        check=True,
    )
    print(f"  {pdf_path.name}")
    return pdf_path


def main():
    targets = sorted(HERE.glob("pages/*.md")) + sorted(HERE.glob("content/*.md"))
    print(f"Rendering {len(targets)} previews ->")
    for t in targets:
        render(t)
    print(f"\nAll in {OUT}/")


if __name__ == "__main__":
    main()
