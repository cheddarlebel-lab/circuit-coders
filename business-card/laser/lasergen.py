#!/usr/bin/env python3
"""
Circuit Coders — laser-engrave business card art generator.

Targets the Bambu H2C / H2D 40W laser module. Produces engrave-ready raster
masters (black = laser marks it) for both dark and light stock, truthful
material previews, and a rounded-rect cut outline for wood/acrylic blanks.

Convention used everywhere: in the *engrave master*, BLACK pixels = "mark this".
  - On black-anodized aluminum, a mark turns BRIGHT SILVER (card body stays black).
  - On wood / light acrylic, a mark turns DARK (card body stays light).
The QR is the only element whose polarity must flip with the material so it
stays a normal dark-on-light (scannable) code after the material inverts it.

Usage:
    python3 lasergen.py
"""

import os
import cv2
import numpy as np
import qrcode
from PIL import Image, ImageDraw, ImageFont

# ----------------------------------------------------------------------------- config
HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, "..", "..", "public", "brand", "logo-512.png")

# Blank geometry. Default = Bambu black-aluminum blank (86 x 54 x 0.4mm).
# CC_CARD_MM="86x53" re-lays the art out for the VMYTH 304 stainless blanks
# (86 x 53 x 0.5mm) that the proven STAINLESS recipe runs on. The whole layout is
# proportional, so this re-flows rather than distorting.
CARD_W_MM, CARD_H_MM = (
    tuple(float(v) for v in os.environ["CC_CARD_MM"].split("x"))
    if os.environ.get("CC_CARD_MM") else (86.0, 54.0)
)
CORNER_MM = 3.0                             # rounded-corner radius

# How far the engraved border frame sits inside the card edge. This sets the
# footprint of the whole etch: at 3.2 the art was only 79.5x47.5 on an 86x54 card
# (92.5%), which read as tiny cards with huge gaps in the 12-up jig. It cannot go
# to 0 -- the jig pocket gives each card CLEAR (0.4mm) of play per side, so a
# flush frame would drop off the card edge onto the tray whenever a blank shifts.
# 0.6 = that play plus half the 0.30mm line width = the tightest safe frame.
BORDER_INSET_MM = 0.6

# CC_NO_BORDER=1 drops the engraved rounded-rect frame entirely (content only).
DRAW_BORDER = os.environ.get("CC_NO_BORDER") != "1"
DPI = 600                                   # engrave-master resolution (matches Temecula card)
SS = 3                                      # supersample factor for clean edges
PXMM = DPI / 25.4                           # px per mm (final)

CONTACT = dict(
    company="CIRCUIT CODERS",
    tagline="ENGINEERING STUDIO",
    name="Leo Lebel",
    title="Founder",
    phone="(760) 672-2461",
    web="circuitcoders.com",
    email="leo@circuitcoders.com",
    qr_url="https://circuitcoders.com",
)

GREEN = (0, 230, 138)                       # circuit-500 brand accent

# Stroke weight of the rounded-square frame around the bolt. The logo's own frame
# was a hairline (~0.25mm at card scale); Leo asked for a bolder outline.
BOLT_FRAME_STROKE_MM = 0.55

FONT_CANDIDATES = {
    "bold": [
        ("/System/Library/Fonts/HelveticaNeue.ttc", 1),
        ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
        ("/System/Library/Fonts/Helvetica.ttc", 1),
    ],
    "regular": [
        ("/System/Library/Fonts/HelveticaNeue.ttc", 0),
        ("/System/Library/Fonts/Supplemental/Arial.ttf", 0),
        ("/System/Library/Fonts/Helvetica.ttc", 0),
    ],
}


# ----------------------------------------------------------------------------- helpers
def mm(v):
    """mm -> supersampled pixels."""
    return int(round(v * PXMM * SS))


def font(weight, size_mm):
    px = max(1, int(round(size_mm * PXMM * SS)))
    for path, idx in FONT_CANDIDATES[weight]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, px, index=idx)
            except Exception:
                continue
    return ImageFont.load_default()


def text_h(draw, s, fnt):
    """Visible glyph height of a string."""
    bb = draw.textbbox((0, 0), s, font=fnt)
    return bb[3] - bb[1]


def draw_text(draw, xy, s, fnt, fill, tracking=0.0):
    """Draw text with its glyph-top aligned to xy[1]; letters share one baseline.

    tracking is extra space (px) inserted between glyphs. All glyphs are placed
    on a common baseline via anchor='ls', so mixed-case strings stay aligned.
    """
    x, y = xy
    ascent, _ = fnt.getmetrics()
    bb = draw.textbbox((0, 0), s, font=fnt)
    baseline = y + ascent - bb[1]            # lift so the glyph top sits at y
    if not tracking:
        draw.text((x, baseline), s, font=fnt, fill=fill, anchor="ls")
        return
    for ch in s:
        draw.text((x, baseline), ch, font=fnt, fill=fill, anchor="ls")
        x += draw.textlength(ch, font=fnt) + tracking


def _text_w(draw, s, fnt, tracking=0.0):
    """Rendered width of a (optionally tracked) string, matching draw_text."""
    if not tracking:
        return draw.textlength(s, font=fnt)
    return sum(draw.textlength(c, font=fnt) for c in s) + tracking * (len(s) - 1)


def draw_text_centered(draw, cx, y, s, fnt, fill, tracking=0.0):
    """draw_text, horizontally centered on cx. Returns the string width."""
    w = _text_w(draw, s, fnt, tracking)
    draw_text(draw, (cx - w / 2, y), s, fnt, fill, tracking=tracking)
    return w


def _logo_ink():
    """Green-dominant pixels of the real logo = the rounded-square frame AND the
    bolt inside it, cropped to the frame's bounding box."""
    img = Image.open(LOGO).convert("RGB")
    a = np.asarray(img).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mask = (g > 120) & (g - r > 30) & (g - b > 10)
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise RuntimeError("bolt not found in logo")
    return mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8)


def bolt_mask():
    """Binary mask of JUST the lightning bolt, with the logo's frame dropped.

    The logo art bakes in a thin rounded-square frame around the bolt, so its
    stroke weight can't be adjusted. We isolate the bolt (the component that does
    not touch the frame's bbox) and let render() redraw the frame at
    BOLT_FRAME_STROKE_MM instead. Returns (bolt_image, bolt_frac) where
    bolt_frac is the bolt's height as a fraction of the frame, so the redrawn
    frame keeps the logo's original proportions.
    """
    ink = _logo_ink()
    n, lbl = cv2.connectedComponents(ink, connectivity=8)
    edge = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
    edge.discard(0)
    inner = [i for i in range(1, n) if i not in edge]
    if not inner:
        raise RuntimeError("bolt not separable from logo frame")
    bolt = lbl == max(inner, key=lambda i: int((lbl == i).sum()))
    ys, xs = np.where(bolt)
    crop = bolt[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return (Image.fromarray((crop * 255).astype(np.uint8)),
            crop.shape[0] / ink.shape[0])


def qr_matrix(url):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                       box_size=1, border=0)
    qr.add_data(url)
    qr.make(fit=True)
    return np.array(qr.get_matrix(), dtype=np.uint8)   # 1 = dark module


# ----------------------------------------------------------------------------- layout
def render(ink_rgb, bg_rgb, qr_dark_material, transparent_bg=False):
    """
    Render the card at supersample scale and return a downsampled RGBA image.

    ink_rgb / bg_rgb : colors for the engraved 'ink' and the card body.
    qr_dark_material : True  -> QR drawn as ink-tile w/ body-colored modules
                               (correct for stock where a mark goes LIGHT)
                       False -> QR drawn as ink modules on body (light stock)
    """
    W, H = mm(CARD_W_MM), mm(CARD_H_MM)
    img = Image.new("RGBA", (W, H),
                    (0, 0, 0, 0) if transparent_bg else (*bg_rgb, 255))
    d = ImageDraw.Draw(img)
    ink = (*ink_rgb, 255)

    # --- border frame -------------------------------------------------------
    if DRAW_BORDER:
        inset = mm(BORDER_INSET_MM)
        d.rounded_rectangle([inset, inset, W - inset, H - inset],
                            radius=mm(CORNER_MM - BORDER_INSET_MM), outline=ink,
                            width=mm(0.30))

    pad = mm(7.2)

    # --- header: bolt in a redrawn frame -----------------------------------
    # Frame is drawn here (not taken from the logo art) so its weight is a knob.
    bolt, bolt_frac = bolt_mask()
    tile = mm(10.5)
    bx, by = pad, mm(6.5)
    d.rounded_rectangle([bx, by, bx + tile, by + tile],
                        radius=int(tile * 0.22), outline=ink,
                        width=mm(BOLT_FRAME_STROKE_MM))
    bh = int(tile * bolt_frac)
    bw = int(bolt.width * bh / bolt.height)
    bolt = bolt.resize((bw, bh), Image.LANCZOS)
    bolt_solid = Image.new("RGBA", bolt.size, ink)
    img.paste(bolt_solid, (bx + (tile - bw) // 2, by + (tile - bh) // 2), bolt)
    bw, bh = tile, tile          # header text lays out against the frame

    cx = bx + bw + mm(4.0)
    f_company = font("bold", 5.1)
    trk = mm(0.55)
    ch = text_h(d, CONTACT["company"], f_company)
    cy = by + (bh - ch) // 2 - mm(1.2)
    draw_text(d, (cx, cy), CONTACT["company"], f_company, ink, tracking=trk)

    f_tag = font("regular", 1.95)
    trk2 = mm(0.95)
    tag_y = cy + ch + mm(2.4)
    draw_text(d, (cx + mm(0.3), tag_y), CONTACT["tagline"], f_tag, ink,
              tracking=trk2)
    # The tracked tagline runs into the QR column horizontally, so the QR must
    # clear it vertically. Header is placed from the top while the QR is
    # centered, so a shorter blank walks the QR up into this text.
    tag_bottom = tag_y + text_h(d, CONTACT["tagline"], f_tag)

    # --- divider -----------------------------------------------------------
    dy = mm(22.0)
    d.rectangle([pad, dy, mm(52.0), dy + mm(0.30)], fill=ink)

    # --- name block --------------------------------------------------------
    f_name = font("bold", 4.3)
    ny = mm(27.0)
    draw_text(d, (pad, ny), CONTACT["name"], f_name, ink)
    nh = text_h(d, CONTACT["name"], f_name)
    f_title = font("regular", 2.4)
    draw_text(d, (pad, ny + nh + mm(1.7)), CONTACT["title"], f_title, ink,
              tracking=mm(0.6))

    # --- contact block (enlarged for legibility) ---------------------------
    f_body = font("regular", 3.0)
    lines = [CONTACT["phone"], CONTACT["web"], CONTACT["email"]]
    ly = mm(37.8)
    pitch = mm(4.2)
    for ln in lines:
        draw_text(d, (pad, ly), ln, f_body, ink)
        ly += pitch

    # --- QR on the right ---------------------------------------------------
    qm = qr_matrix(CONTACT["qr_url"])
    n = qm.shape[0]
    tile_mm = 21.0
    tile = mm(tile_mm)
    quiet = 2                       # quiet-zone modules
    cell = tile / (n + quiet * 2)
    qx = W - pad - tile
    qy = max((H - tile) // 2, tag_bottom + mm(1.2))
    body = (*bg_rgb, 255)

    if qr_dark_material:
        # ink tile (-> silver) with body-colored modules (-> stay dark) = normal QR
        d.rounded_rectangle([qx, qy, qx + tile, qy + tile],
                            radius=mm(1.6), fill=ink)
        for i in range(n):
            for j in range(n):
                if qm[i, j]:
                    x0 = qx + (quiet + j) * cell
                    y0 = qy + (quiet + i) * cell
                    d.rectangle([x0, y0, x0 + cell + 1, y0 + cell + 1], fill=body)
    else:
        # ink modules on body (light stock) = normal QR straight up
        for i in range(n):
            for j in range(n):
                if qm[i, j]:
                    x0 = qx + (quiet + j) * cell
                    y0 = qy + (quiet + i) * cell
                    d.rectangle([x0, y0, x0 + cell + 1, y0 + cell + 1], fill=ink)

    # downsample for clean anti-aliased edges
    return img.resize((mm(CARD_W_MM) // SS, mm(CARD_H_MM) // SS), Image.LANCZOS)


# What the back sells (mode="services"). Kept short so it stays legible at
# ~2.4mm engraved on metal.
BACK_SERVICES = ["Websites  ·  Web Apps  ·  Local SEO",
                 "AI Receptionists  ·  Automation"]


def render_back(ink_rgb, bg_rgb, transparent_bg=False, mode="logo"):
    """Back of the card, centered block, engraved on the reverse face after
    flipping the blanks in the same jig (reads normally -> no mirroring).

    mode="logo"     : bolt + CIRCUIT CODERS + tagline. Pure brand moment.
    mode="services" : bolt + wordmark + what-we-build lines + web. Sells.
    """
    W, H = mm(CARD_W_MM), mm(CARD_H_MM)
    img = Image.new("RGBA", (W, H),
                    (0, 0, 0, 0) if transparent_bg else (*bg_rgb, 255))
    d = ImageDraw.Draw(img)
    ink = (*ink_rgb, 255)
    cx = W // 2

    inset = mm(BORDER_INSET_MM)
    d.rounded_rectangle([inset, inset, W - inset, H - inset],
                        radius=mm(CORNER_MM - BORDER_INSET_MM), outline=ink,
                        width=mm(0.30))
    bolt, bolt_frac = bolt_mask()

    def place_bolt(x_left, y_top, size):
        d.rounded_rectangle([x_left, y_top, x_left + size, y_top + size],
                            radius=int(size * 0.22), outline=ink,
                            width=mm(BOLT_FRAME_STROKE_MM * 1.25))
        bh = int(size * bolt_frac)
        bw = int(bolt.width * bh / bolt.height)
        b = bolt.resize((bw, bh), Image.LANCZOS)
        img.paste(Image.new("RGBA", b.size, ink),
                  (x_left + (size - bw) // 2, y_top + (size - bh) // 2), b)

    if mode == "services":
        f_company = font("bold", 5.0)
        f_svc = font("regular", 2.45)
        tile = mm(11.0)
        gap_top = mm(4.4)                # bolt -> wordmark
        gap_mid = mm(4.8)                # wordmark -> services
        line_pitch = mm(4.2)
        f_web = font("regular", 2.35)
        gap_web = mm(4.6)

        ch = text_h(d, CONTACT["company"], f_company)
        sh = text_h(d, BACK_SERVICES[0], f_svc)
        wh = text_h(d, CONTACT["web"], f_web)
        svc_block = sh + line_pitch * (len(BACK_SERVICES) - 1)
        block_h = tile + gap_top + ch + gap_mid + svc_block + gap_web + wh
        y = (H - block_h) // 2

        place_bolt(cx - tile // 2, y, tile)
        wy = y + tile + gap_top
        draw_text_centered(d, cx, wy, CONTACT["company"], f_company, ink,
                           tracking=mm(0.5))
        sy = wy + ch + gap_mid
        for i, line in enumerate(BACK_SERVICES):
            draw_text_centered(d, cx, sy + i * line_pitch, line, f_svc, ink)
        draw_text_centered(d, cx, sy + svc_block + gap_web, CONTACT["web"],
                           f_web, ink, tracking=mm(0.3))
    else:
        f_company = font("bold", 5.6)
        f_tag = font("regular", 2.2)
        tile = mm(15.5)
        gap1 = mm(5.0)
        gap2 = mm(2.6)
        ch = text_h(d, CONTACT["company"], f_company)
        th = text_h(d, CONTACT["tagline"], f_tag)
        block_h = tile + gap1 + ch + gap2 + th
        y = (H - block_h) // 2

        place_bolt(cx - tile // 2, y, tile)
        wy = y + tile + gap1
        draw_text_centered(d, cx, wy, CONTACT["company"], f_company, ink,
                           tracking=mm(0.6))
        draw_text_centered(d, cx, wy + ch + gap2, CONTACT["tagline"], f_tag,
                           ink, tracking=mm(1.1))

    return img.resize((mm(CARD_W_MM) // SS, mm(CARD_H_MM) // SS), Image.LANCZOS)


def flatten_engrave(rgba, qr_dark_material):
    """Convert a black-ink/white-body render to a grayscale engrave master."""
    return rgba.convert("L")


# ----------------------------------------------------------------------------- cut svg
def write_cut_svg(path):
    w, h, r = CARD_W_MM, CARD_H_MM, CORNER_MM
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<!-- Circuit Coders business card cut outline. Units = mm (1 user unit = 1 mm).
     Import into Bambu Studio laser mode, assign to a CUT operation.
     Anodized-aluminum blanks come pre-cut: you do NOT need this file for metal. -->
<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm"
     viewBox="0 0 {w} {h}">
  <rect x="0.1" y="0.1" width="{w-0.2}" height="{h-0.2}" rx="{r}" ry="{r}"
        fill="none" stroke="#000000" stroke-width="0.1"/>
</svg>
'''
    with open(path, "w") as f:
        f.write(svg)


# ----------------------------------------------------------------------------- main
def main():
    # CC_OUT redirects the art into a subdir so a non-default CC_CARD_MM build
    # (e.g. the 86x53 stainless set) can't clobber the default 86x54 masters
    # that the wood/aluminum .lac projects are built from.
    out = os.path.join(HERE, os.environ["CC_OUT"]) if os.environ.get("CC_OUT") else HERE
    os.makedirs(out, exist_ok=True)

    # CC_SIDE=back -> the branded reverse face. Same file names as the front so
    # the jig builder is identical; put it in its own CC_OUT dir (e.g. back53).
    if os.environ.get("CC_SIDE") == "back":
        back_mode = os.environ.get("CC_BACK", "logo")
        dark = render_back(ink_rgb=(0, 0, 0), bg_rgb=(255, 255, 255), mode=back_mode)
        p = os.path.join(out, "cc-laser-DARK-engrave.png")
        dark.convert("L").save(p, dpi=(DPI, DPI))
        print(f"  wrote {os.path.basename(p)}  (BACK/{back_mode}, {dark.size[0]}x{dark.size[1]} px @ {DPI}dpi)")

        light = render_back(ink_rgb=(0, 0, 0), bg_rgb=(255, 255, 255), mode=back_mode)
        p = os.path.join(out, "cc-laser-LIGHT-engrave.png")
        light.convert("L").save(p, dpi=(DPI, DPI))
        print(f"  wrote {os.path.basename(p)}  (BACK/{back_mode})")

        # truthful preview: silver mark on black anodized
        prev = render_back(ink_rgb=(210, 210, 210), bg_rgb=(20, 20, 20), mode=back_mode)
        p = os.path.join(out, "cc-card-PREVIEW.png")
        prev.convert("RGB").save(p)
        print(f"  wrote {os.path.basename(p)}  (BACK/{back_mode} preview)")
        return

    # 1. Engrave master for DARK stock (black anodized aluminum / black acrylic)
    dark = render(ink_rgb=(0, 0, 0), bg_rgb=(255, 255, 255),
                  qr_dark_material=True)
    dark_master = flatten_engrave(dark, True)
    p = os.path.join(out, "cc-laser-DARK-engrave.png")
    dark_master.save(p, dpi=(DPI, DPI))
    print(f"  wrote {os.path.basename(p)}  ({dark_master.size[0]}x{dark_master.size[1]} px @ {DPI}dpi)")

    # 2. Engrave master for LIGHT stock (wood / bamboo / light acrylic)
    light = render(ink_rgb=(0, 0, 0), bg_rgb=(255, 255, 255),
                   qr_dark_material=False)
    light_master = flatten_engrave(light, False)
    p = os.path.join(out, "cc-laser-LIGHT-engrave.png")
    light_master.save(p, dpi=(DPI, DPI))
    print(f"  wrote {os.path.basename(p)}  ({light_master.size[0]}x{light_master.size[1]} px @ {DPI}dpi)")

    # 3. Preview — black anodized aluminum (mark = silver). Truthful: mono silver.
    metal = render(ink_rgb=(214, 216, 220), bg_rgb=(14, 16, 18),
                   qr_dark_material=True)
    p = os.path.join(out, "cc-preview-anodized.png")
    metal.convert("RGB").save(p)
    print(f"  wrote {os.path.basename(p)}  (preview: silver on black anodized)")

    # 3b. Preview — green-anodized stock variant (body green, mark silver)
    green_metal = render(ink_rgb=(225, 228, 232), bg_rgb=(6, 60, 40),
                         qr_dark_material=True)
    p = os.path.join(out, "cc-preview-anodized-green.png")
    green_metal.convert("RGB").save(p)
    print(f"  wrote {os.path.basename(p)}  (preview: silver on GREEN anodized)")

    # 4. Preview — wood (mark = dark char on warm wood)
    wood = render(ink_rgb=(38, 26, 14), bg_rgb=(202, 164, 114),
                  qr_dark_material=False)
    p = os.path.join(out, "cc-preview-wood.png")
    wood.convert("RGB").save(p)
    print(f"  wrote {os.path.basename(p)}  (preview: char on basswood)")

    # 5. Cut outline for wood / acrylic blanks
    p = os.path.join(out, "cc-card-CUT.svg")
    write_cut_svg(p)
    print(f"  wrote {os.path.basename(p)}  (rounded-rect cut path, mm)")

    # 6. "Just the card" pair, Temecula-Lanes style — single blank
    size = f"{CARD_W_MM:g} x {CARD_H_MM:g}"
    dark_master.save(os.path.join(out, "cc-card-ENGRAVE.png"), dpi=(DPI, DPI))
    metal.convert("RGB").save(os.path.join(out, "cc-card-PREVIEW.png"))
    print(f"  wrote cc-card-ENGRAVE.png + cc-card-PREVIEW.png  (single {size}mm card — IMPORT THIS)")
    readme = (
        "CIRCUIT CODERS - metal QR business card\n"
        "=======================================\n"
        f"Blank    : {size} mm  (laser ablates the surface -> bright silver)\n"
        "Machine  : Bambu H2C, 40W laser, Bambu Suite\n\n"
        "FILES\n"
        f"  cc-card-ENGRAVE.png  <- IMPORT THIS. Fits the {size}mm card. Black = engrave->silver.\n"
        "  cc-card-PREVIEW.png  <- Finished look (QR verified -> https://circuitcoders.com).\n\n"
        "PREFER THE READY-MADE PROJECT\n"
        "  cc-card-stainless.lac already carries the proven recipe + art. Open it in\n"
        "  Bambu Suite and hit Make - no import or sizing needed. Steps below are the\n"
        "  manual fallback only.\n\n"
        "BAMBU SUITE (manual fallback)\n"
        "  1. New laser project. Import cc-card-ENGRAVE.png.\n"
        "  2. Process type: Laser Image (raster) engrave.\n"
        f"  3. Size to the blank: {size} mm. Wipe the blank clean first.\n"
        "  4. Place blank flat on bed. Run auto-focus / height probe.\n"
        "  5. Glasses on, enclosure closed, exhaust on.\n\n"
        "SETTINGS\n"
        "  Coated VMYTH 304 stainless: use cc-card-stainless.lac (22% / 500 mm/s /\n"
        "  0.06 interval / per-line 2 / air ON) - the dialed-in recipe from the\n"
        "  LaneTab run. Trim ladder: too warped -> 20, then speed 550. Too light -> 24.\n"
        "  Bare black anodized aluminum: start ~30-45% / 400-700 mm/s and test first.\n\n"
        "QR encodes: https://circuitcoders.com  (low density - very robust)\n"
    )
    with open(os.path.join(out, "cc-card-README.txt"), "w") as f:
        f.write(readme)
    print("  wrote cc-card-README.txt")


if __name__ == "__main__":
    print("Building Circuit Coders laser-engrave artwork...")
    main()
    print("Done.")
