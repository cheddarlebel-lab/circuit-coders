#!/usr/bin/env python3
"""
Circuit Coders — Daily AI Blog Post Generator

Reads the next unchecked keyword from ~/memory/seo-assets/keyword-queue.md,
drafts a full BlogPost object in Leo's voice via the `claude -p` CLI,
appends it to src/lib/blog-posts.ts, and marks the keyword as published.

Intended to run daily via launchctl / cron. Emits a JSON summary on stdout.

Usage:
    python3 scripts/generate-blog-post.py                 # pull next queued keyword
    python3 scripts/generate-blog-post.py --dry-run       # draft only, don't write
    python3 scripts/generate-blog-post.py --slug foo      # force a specific slug/title
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import subprocess
import sys
from datetime import date
from typing import Optional

REPO = pathlib.Path(__file__).resolve().parent.parent
BLOG_POSTS_TS = REPO / "src" / "lib" / "blog-posts.ts"
QUEUE = pathlib.Path.home() / "memory" / "seo-assets" / "keyword-queue.md"

SYSTEM_PROMPT = """You are a ghostwriter for Circuit Coders, a small web design shop in Fallbrook, CA run by Leo Lebel. You write blog posts in Leo's voice for circuitcoders.com/blog.

Leo's voice:
- Direct, punchy, zero agency-speak. No "transforming your brand" or "crafting experiences."
- Specific numbers everywhere ($499, 48 hours, 60–90 days, 3–5 MB, $150–$250).
- Concrete references to North County San Diego: Fallbrook, Oceanside, Carlsbad, Vista, San Marcos, Bonsall, Pala.
- Cuts bullshit. Calls out bad patterns bluntly ("A chatbot. For a detailing shop, a chatbot is a tax on real customers.").
- Practical advice a small-business owner can act on today.
- Ends every post with a soft CTA referencing the $499 flat / 48-hour turnaround / free mockup offer.

Pricing baseline to reference: Circuit Coders builds $499 flat, 48-hour turnaround, custom Next.js on Vercel, one round of revisions, free mockup first. Hosting+updates optional at $50/mo. Integrations (reservations, Stripe, booking platforms) quoted as $200–$500 add-ons.

You output ONLY a valid JSON object matching this TypeScript type — no markdown, no commentary, no code fences:

type BlogPost = {
  slug: string;                    // kebab-case, no leading slash
  title: string;                   // ~60–80 chars, keyword + benefit
  description: string;             // ~140–160 chars, meta description, compelling
  keywords: string[];              // 6–9 items, mix primary + semantic variants + local cities
  publishedAt: string;             // YYYY-MM-DD
  updatedAt: string;               // YYYY-MM-DD
  readTime: number;                // 6–9 integer
  category: string;                // e.g. "Local SEO" | "Pricing" | "SEO" | "Tech"
  author: "Circuit Coders";
  heroTag: string;                 // UPPERCASE · SEPARATED · TAG
  sections: Array<{
    heading: string;
    paragraphs: string[];          // 2–4 per section, each 2–4 sentences
    list?: { title?: string; items: string[] };  // optional, 4–7 items when present
    callout?: string;              // optional, ~1–2 sentences, emphatic
  }>;                              // 5–7 sections total
  faqs: Array<{ q: string; a: string }>;  // 3–5 items, a is 1–3 sentences
};

Rules for sections:
- First section: name the pain, ground it in North County specifics.
- Middle sections: mix of "what to do" lists and "what to cut" lists.
- One section must focus on local SEO (Google Business Profile, citations, schema.org, '[service] + [city]' patterns).
- One section should reference pricing/market rates vs the $499 flat.
- Final section: real-examples or soft-CTA with callout offering the free audit/mockup.

Rules for FAQs:
- Questions must be things a North-County small-business owner would actually Google.
- Answers must contain at least one concrete number or ranking timeline.
"""

USER_PROMPT_TEMPLATE = """Write a full Circuit Coders blog post for this target:

- Slug: {slug}
- Title (editable, improve if weak): {title}
- Primary keyword: {keyword}
- Target city / region: {city}
- Vertical: {vertical}

Today's date (use for publishedAt and updatedAt): {today}

Output the BlogPost JSON object only. No preamble, no ```json fences, no trailing commentary."""


def parse_queue() -> list[dict]:
    if not QUEUE.exists():
        print(f"[fatal] queue not found at {QUEUE}", file=sys.stderr)
        sys.exit(2)
    rows = []
    for line in QUEUE.read_text().splitlines():
        m = re.match(r"^-\s*\[( |x)\]\s*(.+)$", line.strip())
        if not m:
            continue
        done = m.group(1) == "x"
        fields = [f.strip() for f in m.group(2).split("|")]
        if len(fields) < 5:
            continue
        rows.append({
            "done": done,
            "slug": fields[0],
            "title": fields[1],
            "keyword": fields[2],
            "city": fields[3],
            "vertical": fields[4],
            "raw": line,
        })
    return rows


def mark_done(raw_line: str) -> None:
    text = QUEUE.read_text()
    new = text.replace(raw_line, raw_line.replace("- [ ]", "- [x]", 1), 1)
    QUEUE.write_text(new)


def call_claude(system: str, user: str) -> str:
    # Uses the authenticated Claude Code CLI. --print runs non-interactively.
    proc = subprocess.run(
        ["claude", "--print", "--append-system-prompt", system, user],
        capture_output=True,
        text=True,
        timeout=300,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"claude CLI failed: {proc.stderr}")
    return proc.stdout.strip()


def extract_json(blob: str) -> dict:
    # Strip code fences if model slips them in.
    blob = re.sub(r"^```(?:json)?\s*|\s*```$", "", blob.strip(), flags=re.MULTILINE)
    # Grab the first {...} block (greedy to last brace, since nested).
    m = re.search(r"\{.*\}", blob, re.DOTALL)
    if not m:
        raise ValueError(f"no JSON object found in model output:\n{blob[:400]}")
    return json.loads(m.group(0))


def ts_literal(value) -> str:
    """Serialize a Python value to a TypeScript object-literal string."""
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return "[" + ", ".join(ts_literal(v) for v in value) + "]"
    if isinstance(value, dict):
        parts = [f"{k}: {ts_literal(v)}" for k, v in value.items()]
        return "{ " + ", ".join(parts) + " }"
    if value is None:
        return "undefined"
    raise TypeError(f"unsupported type: {type(value)}")


def render_post_object(post: dict) -> str:
    """Render the post dict as a TS object literal, matching existing file style."""
    indent = "  "
    lines = [f"{indent}{{"]
    for key in (
        "slug", "title", "description", "keywords",
        "publishedAt", "updatedAt", "readTime", "category", "author", "heroTag",
    ):
        lines.append(f"{indent*2}{key}: {ts_literal(post[key])},")

    lines.append(f"{indent*2}sections: [")
    for section in post["sections"]:
        lines.append(f"{indent*3}{{")
        lines.append(f"{indent*4}heading: {ts_literal(section['heading'])},")
        lines.append(f"{indent*4}paragraphs: [")
        for p in section["paragraphs"]:
            lines.append(f"{indent*5}{ts_literal(p)},")
        lines.append(f"{indent*4}],")
        if section.get("list"):
            lst = section["list"]
            lines.append(f"{indent*4}list: {{")
            if lst.get("title"):
                lines.append(f"{indent*5}title: {ts_literal(lst['title'])},")
            lines.append(f"{indent*5}items: [")
            for item in lst["items"]:
                lines.append(f"{indent*6}{ts_literal(item)},")
            lines.append(f"{indent*5}],")
            lines.append(f"{indent*4}}},")
        if section.get("callout"):
            lines.append(f"{indent*4}callout: {ts_literal(section['callout'])},")
        lines.append(f"{indent*3}}},")
    lines.append(f"{indent*2}],")

    if post.get("faqs"):
        lines.append(f"{indent*2}faqs: [")
        for faq in post["faqs"]:
            lines.append(f"{indent*3}{{ q: {ts_literal(faq['q'])}, a: {ts_literal(faq['a'])} }},")
        lines.append(f"{indent*2}],")

    lines.append(f"{indent}}},")
    return "\n".join(lines)


def insert_into_blog_posts(post_literal: str) -> None:
    src = BLOG_POSTS_TS.read_text()
    anchor = "export const blogPosts: BlogPost[] = [\n"
    if anchor not in src:
        raise RuntimeError("anchor not found in blog-posts.ts")
    updated = src.replace(anchor, anchor + post_literal + "\n", 1)
    BLOG_POSTS_TS.write_text(updated)


def pick_target(rows: list[dict], forced_slug: Optional[str]) -> dict:
    if forced_slug:
        for r in rows:
            if r["slug"] == forced_slug:
                return r
        raise SystemExit(f"slug {forced_slug!r} not found in queue")
    pending = [r for r in rows if not r["done"]]
    if not pending:
        raise SystemExit("queue exhausted — add more keywords to keyword-queue.md")
    return pending[0]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--slug", default=None)
    args = parser.parse_args()

    rows = parse_queue()
    target = pick_target(rows, args.slug)

    existing = BLOG_POSTS_TS.read_text()
    if f'slug: "{target["slug"]}"' in existing:
        print(json.dumps({"status": "skipped", "reason": "slug already in blog-posts.ts", "slug": target["slug"]}))
        mark_done(target["raw"])
        return 0

    user_prompt = USER_PROMPT_TEMPLATE.format(
        slug=target["slug"],
        title=target["title"],
        keyword=target["keyword"],
        city=target["city"],
        vertical=target["vertical"],
        today=date.today().isoformat(),
    )

    raw = call_claude(SYSTEM_PROMPT, user_prompt)
    post = extract_json(raw)

    # Hardcode invariants the model might drift on.
    post["author"] = "Circuit Coders"
    post["publishedAt"] = date.today().isoformat()
    post["updatedAt"] = date.today().isoformat()
    # Force slug from queue so models can't freestyle off-topic URLs.
    post["slug"] = target["slug"]
    # If the model rewrote the title past recognition, fall back to queue title.
    if not post.get("title") or target["keyword"].lower() not in post["title"].lower():
        post["title"] = target["title"]

    if args.dry_run:
        print(json.dumps({"status": "dry-run", "post": post}, indent=2))
        return 0

    literal = render_post_object(post)
    insert_into_blog_posts(literal)
    mark_done(target["raw"])

    print(json.dumps({
        "status": "published",
        "slug": post["slug"],
        "title": post["title"],
        "url": f"https://circuitcoders.com/blog/{post['slug']}",
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
