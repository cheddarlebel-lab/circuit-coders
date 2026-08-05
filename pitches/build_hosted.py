"""Assemble the hosted /docs proposals from the shared house CSS + a body file.

The existing docs each inline their own copy of the stylesheet, so these do too —
one self-contained file per proposal, no shared runtime dependency. The CSS lives
in assets/house-proposal.css so a change to the house style can be re-applied to
every proposal by re-running this.
"""
import pathlib, re, sys

HERE = pathlib.Path(__file__).parent
DOCS = HERE.parent / "public" / "docs"
CSS = (HERE / "assets" / "house-proposal.css").read_text()

DOCS_LIST = [
    ("semperfi-meta-ads-proposal.body.html", "semper-fi-meta-ads-proposal.html",
     "Meta Advertising Proposal &middot; Semper Fi Sports Cave",
     "Meta advertising proposal for Semper Fi Sports Cave, Fallbrook CA."),
    ("fbiff-proposal.body.html", "fbiff-proposal.html",
     "Festival Website &amp; Event Advertising Proposal &middot; Fallbrook / Bonsall International Film Festival",
     "Website and event advertising proposal for the Fallbrook / Bonsall International Film Festival."),
]

TPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<style>
{css}
</style>
</head>
<body>
{body}
</body>
</html>
"""


def build():
    problems = []
    for src, out, title, desc in DOCS_LIST:
        body = (HERE / src).read_text()
        html = TPL.format(title=title, desc=desc, css=CSS, body=body)
        (DOCS / out).write_text(html, encoding="utf-8")
        print(f"  {out}  {len(html)/1024:.0f} KB")

        # Every class used in the body must exist in the stylesheet, or it
        # renders as unstyled text and nobody notices until the client opens it.
        used = set(re.findall(r'class="([^"]+)"', body))
        used = {c for group in used for c in group.split()}
        for c in sorted(used):
            if f".{c}" not in CSS:
                problems.append(f"{out}: class '{c}' has no rule in house-proposal.css")

        # Local asset references must resolve on disk.
        for ref in re.findall(r'(?:src|href)="(?!https?:|mailto:|#)([^"]+)"', body):
            if not (DOCS / ref).exists():
                problems.append(f"{out}: missing asset {ref}")

        # Anchors in the table of contents must have targets.
        anchors = set(re.findall(r'href="#([a-z0-9]+)"', body))
        ids = set(re.findall(r'id="([a-z0-9]+)"', body))
        for a in sorted(anchors - ids):
            problems.append(f"{out}: TOC link #{a} has no matching id")

    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  x", p)
        sys.exit(1)
    print("\nBoth docs built: every class styled, every asset present, every anchor resolves.")


if __name__ == "__main__":
    build()
