#!/usr/bin/env python3
"""
Circuit Coders — laser JIG + matched connected overlay generator.

Produces a self-consistent pair:
  1. A printable FDM jig tray (STL) that holds a grid of 85.6x54 mm card blanks
     in recessed pockets — print it on the Bambu H2C, drop blanks in.
  2. ONE connected engrave overlay (single PNG) sized to the jig, with the card
     art placed dead-center over every pocket. Import once, engrave the whole
     tray in a single laser job.

Because this script DESIGNS the jig, it knows every pocket coordinate exactly,
so the overlay is guaranteed to line up with the physical pockets.

To instead match an EXISTING jig, set COLS/ROWS/CARD/CLEAR/WALL to that jig's
real geometry (or feed pocket centers into `pocket_centers`) and rerun.

    python3 jiggen.py
"""

import os
import struct
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))

# --- card art (already 85.6x54 mm @ 500 dpi from lasergen.py) -----------------
DARK_MASTER = os.path.join(HERE, "cc-laser-DARK-engrave.png")
LIGHT_MASTER = os.path.join(HERE, "cc-laser-LIGHT-engrave.png")

# --- geometry (mm) ------------------------------------------------------------
CARD_W, CARD_H = 86.0, 54.0    # Bambu black-aluminum blank (matches lasergen)
CLEAR = 0.4          # clearance per side: pocket interior = card + 2*CLEAR
WALL = 5.5           # fresh 12-up board: card-edge gap ~6.3mm (max that fits 12)
BASE_T = 1.6         # jig baseplate thickness
WALL_H = 1.4         # pocket wall height above the baseplate
COLS, ROWS = 3, 4    # 3 x 4 = 12 pockets in the physical tray
ACTIVE_SLOTS = 12    # how many pockets to actually engrave, filled from the TOP

# Laser/printer work area sanity check (H2C). CONFIRM on the machine; if the
# laser area is smaller than the jig, drop to COLS,ROWS = 2,3.
BED_W, BED_H = 320.0, 300.0

PXMM = 600.0 / 25.4  # must match lasergen.py master resolution (600 dpi)

POCKET_W = CARD_W + 2 * CLEAR
POCKET_H = CARD_H + 2 * CLEAR
JIG_W = COLS * POCKET_W + (COLS + 1) * WALL
JIG_H = ROWS * POCKET_H + (ROWS + 1) * WALL


def pocket_centers():
    """(cx, cy) of every pocket in jig-local mm, origin = bottom-left corner."""
    out = []
    for r in range(ROWS):
        for c in range(COLS):
            x0 = WALL + c * (POCKET_W + WALL)
            y0 = WALL + r * (POCKET_H + WALL)
            out.append((x0 + POCKET_W / 2.0, y0 + POCKET_H / 2.0))
    return out


def active_centers():
    """The ACTIVE_SLOTS pockets to engrave, taken from the TOP rows down,
    left-to-right within a row."""
    pcs = pocket_centers()
    order = sorted(range(len(pcs)), key=lambda i: (-pcs[i][1], pcs[i][0]))
    chosen = set(order[:ACTIVE_SLOTS])
    return [pcs[i] for i in order[:ACTIVE_SLOTS]], chosen


# --- STL jig ------------------------------------------------------------------
def box_tris(x, y, z, w, d, h):
    v = [(x, y, z), (x + w, y, z), (x + w, y + d, z), (x, y + d, z),
         (x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)]
    faces = [(0, 3, 1), (1, 3, 2), (4, 5, 7), (5, 6, 7), (0, 1, 5), (0, 5, 4),
             (2, 3, 7), (2, 7, 6), (0, 4, 7), (0, 7, 3), (1, 2, 6), (1, 6, 5)]
    return [(v[a], v[b], v[c]) for a, b, c in faces]


def write_stl(path, tris):
    with open(path, "wb") as f:
        f.write(b"\0" * 80)
        f.write(struct.pack("<I", len(tris)))
        for t in tris:
            f.write(struct.pack("<3f", 0, 0, 0))
            for vert in t:
                f.write(struct.pack("<3f", *vert))
            f.write(struct.pack("<H", 0))


def build_jig_stl(path):
    tris = []
    # baseplate
    tris += box_tris(0, 0, 0, JIG_W, JIG_H, BASE_T)
    # vertical walls (COLS+1 of them)
    for c in range(COLS + 1):
        x = c * (POCKET_W + WALL)
        tris += box_tris(x, 0, BASE_T, WALL, JIG_H, WALL_H)
    # horizontal walls (ROWS+1 of them)
    for r in range(ROWS + 1):
        y = r * (POCKET_H + WALL)
        tris += box_tris(0, y, BASE_T, JIG_W, WALL, WALL_H)
    write_stl(path, tris)
    return len(tris)


# --- connected overlay --------------------------------------------------------
def build_overlay(master_path, out_path, body_rgb, ink_rgb, preview=False):
    master = Image.open(master_path).convert("L")        # black art on white
    mw, mh = master.size

    W = int(round(JIG_W * PXMM))
    H = int(round(JIG_H * PXMM))
    active, _ = active_centers()

    if preview:
        canvas = Image.new("RGB", (W, H), body_rgb)
        d = ImageDraw.Draw(canvas)
        # draw ALL jig pockets so the empty (un-engraved) ones are visible too
        for cx, cy in pocket_centers():
            x0 = int((cx - POCKET_W / 2) * PXMM)
            y0 = int((JIG_H - (cy + POCKET_H / 2)) * PXMM)  # flip Y for image
            x1 = int((cx + POCKET_W / 2) * PXMM)
            y1 = int((JIG_H - (cy - POCKET_H / 2)) * PXMM)
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(3 * PXMM),
                                fill=body_rgb, outline=(90, 90, 90),
                                width=max(1, int(0.4 * PXMM)))
        ink_tile = Image.new("RGB", master.size, ink_rgb)
        art_mask = master.point(lambda p: 255 - p)        # black art -> white mask
    else:
        canvas = Image.new("L", (W, H), 255)              # white = no engrave

    for cx, cy in active:                                  # only the active slots
        px = int(round(cx * PXMM - mw / 2))
        py = int(round((JIG_H - cy) * PXMM - mh / 2))      # flip Y for image
        if preview:
            canvas.paste(ink_tile, (px, py), art_mask)
        else:
            canvas.paste(master, (px, py))                 # keep black art

    if preview:
        canvas.save(out_path)
    else:
        canvas.save(out_path, dpi=(500, 500))
    return canvas.size


def build_cut_svg(out_path):
    """Cut outline for the WHOLE engraved board, registered to the overlay grid.

    One rounded-rect (86x54, r=CORNER) per ACTIVE card, at the exact same centers
    the overlay used. Same JIG_W x JIG_H canvas as the overlay, so if you align
    this cut to the engraving (same outer rectangle / center), every card's cut
    lands dead on its engraving. Units = mm. Import -> assign LaserLineCut."""
    corner = 3.0
    active, _ = active_centers()
    rects = []
    for cx, cy in active:
        x = cx - CARD_W / 2.0
        y = (JIG_H - cy) - CARD_H / 2.0          # SVG origin = top-left (y down)
        rects.append(
            f'  <rect x="{x:.3f}" y="{y:.3f}" width="{CARD_W}" height="{CARD_H}" '
            f'rx="{corner}" ry="{corner}" fill="none" stroke="#000000" stroke-width="0.1"/>')
    svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
           f'<!-- Circuit Coders {ACTIVE_SLOTS}-up CUT outline. Registered to '
           f'cc-overlay-*.png (same {JIG_W:.1f}x{JIG_H:.1f} mm canvas + card centers).\n'
           f'     Engrave first, DO NOT move the board, then import this, align it '
           f'to the engraving, assign LaserLineCut, run cut-only. Units = mm. -->\n'
           f'<svg xmlns="http://www.w3.org/2000/svg" width="{JIG_W:.3f}mm" '
           f'height="{JIG_H:.3f}mm" viewBox="0 0 {JIG_W:.3f} {JIG_H:.3f}">\n'
           + "\n".join(rects) + "\n</svg>\n")
    with open(out_path, "w") as f:
        f.write(svg)
    return len(rects)


def build_cut_dxf(out_path):
    """Cut outlines for the engraved board as a DXF in absolute mm.

    Built to be the engrave file with ONLY the card outlines: same JIG_W x JIG_H
    frame as cc-overlay-*.png and the same card centers, so it imports at the
    identical size/position as the engrave and the outlines land on each card.
    DXF carries real-world units (INSUNITS=4 = mm) so BambuSuite imports at the
    EXACT physical size (no DPI/scale guessing like SVG/PNG). The 4 corner ticks
    lock the frame to the engrave overlay's full 270.4x231.7 mm extent so you set
    the same size as the engrave and it drops on. Origin = bottom-left (DXF y-up).
    Import -> pick 'Cutting'."""
    import math
    corner = 3.0
    bulge = math.tan(math.radians(90) / 4)        # 0.41421356 = 90-deg arc
    active, _ = active_centers()
    out = ["0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4",
           "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES"]

    def line(x0, y0, x1, y1, layer):
        out.extend(["0", "LINE", "8", layer, "10", f"{x0:.4f}", "20", f"{y0:.4f}",
                    "30", "0", "11", f"{x1:.4f}", "21", f"{y1:.4f}", "31", "0"])

    # 12 card outlines (rounded rects) at the exact overlay card centers
    for cx, cy in active:
        x0, y0 = cx - CARD_W / 2, cy - CARD_H / 2
        x1, y1 = cx + CARD_W / 2, cy + CARD_H / 2
        r = corner
        # CCW; code 42 bulge applies from this vertex to the next
        verts = [(x0 + r, y0, 0), (x1 - r, y0, bulge), (x1, y0 + r, 0),
                 (x1, y1 - r, bulge), (x1 - r, y1, 0), (x0 + r, y1, bulge),
                 (x0, y1 - r, 0), (x0, y0 + r, bulge)]
        out += ["0", "LWPOLYLINE", "8", "CUT", "100", "AcDbEntity",
                "100", "AcDbPolyline", "90", str(len(verts)), "70", "1"]
        for x, y, b in verts:
            out += ["10", f"{x:.4f}", "20", f"{y:.4f}"]
            if b:
                out += ["42", f"{b:.8f}"]

    # corner registration ticks -> force the extent to the FULL engrave frame
    # (0,0)..(JIG_W,JIG_H), so the file matches the engrave overlay's size 1:1
    t = 6.0
    W, H = JIG_W, JIG_H
    for (cxn, cyn, dx, dy) in [(0, 0, 1, 1), (W, 0, -1, 1),
                               (0, H, 1, -1), (W, H, -1, -1)]:
        line(cxn, cyn, cxn + dx * t, cyn, "REG")
        line(cxn, cyn, cxn, cyn + dy * t, "REG")

    out += ["0", "ENDSEC", "0", "EOF"]
    with open(out_path, "w") as f:
        f.write("\n".join(out) + "\n")
    return len(active)


def main():
    print(f"Jig: {COLS}x{ROWS} = {COLS*ROWS} pockets | engraving TOP {ACTIVE_SLOTS} | "
          f"outer {JIG_W:.1f} x {JIG_H:.1f} mm | pocket {POCKET_W:.1f} x {POCKET_H:.1f} mm")
    if JIG_W > BED_W or JIG_H > BED_H:
        print(f"  !! jig {JIG_W:.0f}x{JIG_H:.0f} EXCEEDS assumed work area "
              f"{BED_W:.0f}x{BED_H:.0f} mm — lower COLS/ROWS")

    n = build_jig_stl(os.path.join(HERE, "cc-jig-12up.stl"))
    print(f"  wrote cc-jig-12up.stl  ({n} tris)  -> print on H2C, single color")

    s = build_overlay(DARK_MASTER, os.path.join(HERE, "cc-overlay-DARK.png"),
                      (14, 16, 18), (214, 216, 220))
    print(f"  wrote cc-overlay-DARK.png  ({s[0]}x{s[1]} px) -> engrave for anodized aluminum / dark stock")

    s = build_overlay(LIGHT_MASTER, os.path.join(HERE, "cc-overlay-LIGHT.png"),
                      (202, 164, 114), (38, 26, 14))
    print(f"  wrote cc-overlay-LIGHT.png ({s[0]}x{s[1]} px) -> engrave for wood / light stock")

    build_overlay(DARK_MASTER, os.path.join(HERE, "cc-overlay-PREVIEW.png"),
                  (14, 16, 18), (214, 216, 220), preview=True)
    print(f"  wrote cc-overlay-PREVIEW.png  -> visual of the whole connected tray")

    # coordinate dump for matching the laser job / re-aiming to another jig
    _, chosen = active_centers()
    lines = [f"# Circuit Coders laser jig — {COLS}x{ROWS} pockets, engraving TOP {ACTIVE_SLOTS}",
             "# pocket centers (mm, origin = bottom-left corner)",
             f"# jig outer: {JIG_W:.2f} x {JIG_H:.2f} mm | card {CARD_W}x{CARD_H} | clearance {CLEAR}/side | wall {WALL}",
             ""]
    for i, (cx, cy) in enumerate(pocket_centers()):
        tag = "ENGRAVE" if i in chosen else "empty  "
        lines.append(f"pocket {i:02d} [{tag}]: x={cx:7.2f}  y={cy:7.2f}")
    with open(os.path.join(HERE, "cc-jig-pockets.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")
    print("  wrote cc-jig-pockets.txt")

    nrect = build_cut_svg(os.path.join(HERE, "cc-jig-CUT.svg"))
    print(f"  wrote cc-jig-CUT.svg  ({nrect} card outlines, registered to the overlay grid)")
    ndxf = build_cut_dxf(os.path.join(HERE, "cc-jig-CUT.dxf"))
    print(f"  wrote cc-jig-CUT.dxf  ({ndxf} card outlines, absolute mm -> imports at true size)")


if __name__ == "__main__":
    main()
    print("Done.")
