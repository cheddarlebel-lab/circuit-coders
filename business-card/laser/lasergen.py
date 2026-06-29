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
import numpy as np
import qrcode
from PIL import Image, ImageDraw, ImageFont

# ----------------------------------------------------------------------------- config
HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, "..", "..", "public", "brand", "logo-512.png")

CARD_W_MM, CARD_H_MM = 86.0, 54.0          # Bambu black-aluminum blank (86 x 54 x 0.4mm)
CORNER_MM = 3.0                             # rounded-corner radius
DPI = 600                                   # engrave-master resolution (matches Temecula card)
SS = 3                                      # supersample factor for clean edges
PXMM = DPI / 25.4                           # px per mm (final)

CONTACT = dict(
    company="CIRCUIT CODERS",
    tagline="ENGINEERING STUDIO",
    name="Leo Lebel",
    title="Founder",
    phone="(442) 297-8170",
    web="circuitcoders.com",
    email="admin@circuitcoders.com",
    qr_url="https://circuitcoders.com",
)

GREEN = (0, 230, 138)                       # circuit-500 brand accent

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


def bolt_mask():
    """Binary mask of the Circuit Coders lightning bolt, lifted from the real logo."""
    img = Image.open(LOGO).convert("RGB")
    a = np.asarray(img).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # bolt = bright + clearly green-dominant (the dark frame/background fails this)
    mask = (g > 120) & (g - r > 30) & (g - b > 10)
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise RuntimeError("bolt not found in logo")
    crop = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return Image.fromarray((crop * 255).astype(np.uint8))


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
    inset = mm(3.2)
    d.rounded_rectangle([inset, inset, W - inset, H - inset],
                        radius=mm(CORNER_MM * 0.6), outline=ink, width=mm(0.30))

    pad = mm(7.2)

    # --- header: bolt + company -------------------------------------------
    bolt = bolt_mask()
    bh = mm(10.5)
    bw = int(bolt.width * bh / bolt.height)
    bolt = bolt.resize((bw, bh), Image.LANCZOS)
    bolt_solid = Image.new("RGBA", bolt.size, ink)
    bx, by = pad, mm(6.5)
    img.paste(bolt_solid, (bx, by), bolt)

    cx = bx + bw + mm(4.0)
    f_company = font("bold", 5.1)
    trk = mm(0.55)
    ch = text_h(d, CONTACT["company"], f_company)
    cy = by + (bh - ch) // 2 - mm(1.2)
    draw_text(d, (cx, cy), CONTACT["company"], f_company, ink, tracking=trk)

    f_tag = font("regular", 1.95)
    trk2 = mm(0.95)
    draw_text(d, (cx + mm(0.3), cy + ch + mm(2.4)), CONTACT["tagline"],
              f_tag, ink, tracking=trk2)

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
    qy = (H - tile) // 2
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
    out = HERE

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

    # 6. "Just the card" pair, Temecula-Lanes style — single 86x54 Bambu blank
    dark_master.save(os.path.join(out, "cc-card-ENGRAVE.png"), dpi=(DPI, DPI))
    metal.convert("RGB").save(os.path.join(out, "cc-card-PREVIEW.png"))
    print("  wrote cc-card-ENGRAVE.png + cc-card-PREVIEW.png  (single 86x54 card — IMPORT THIS)")
    readme = (
        "CIRCUIT CODERS - metal QR business card\n"
        "=======================================\n"
        "Material : Bambu Lab Black Aluminum Card  86 x 54 x 0.4 mm\n"
        "           (laser ablates dye -> bright silver)\n"
        "Machine  : Bambu H2C, 40W laser, Bambu Suite\n\n"
        "FILES\n"
        "  cc-card-ENGRAVE.png  <- IMPORT THIS. Fits the 86x54 card. Black = engrave->silver.\n"
        "  cc-card-PREVIEW.png  <- Finished look (QR verified -> https://circuitcoders.com).\n\n"
        "BAMBU SUITE\n"
        "  1. New laser project. Import cc-card-ENGRAVE.png.\n"
        "  2. Process type: Laser Image (raster) engrave.\n"
        "  3. Size to the Bambu card: 86 x 54 mm. Wipe the blank clean first.\n"
        "  4. Place blank flat on bed (magnets/tape). Run auto-focus / height probe.\n"
        "  5. Glasses on, enclosure closed, exhaust on.\n\n"
        "SETTINGS (black anodized - go LOW power, it ablates easily)\n"
        "  Fill/raster: ~30-45% power, ~400-700 mm/s, 1 pass, line interval 0.05-0.06 mm.\n"
        "  >>> Run a small power/speed TEST SQUARE in a corner first. Tune for bright,\n"
        "      crisp silver. Too much power blooms edges and softens the QR.\n\n"
        "QR encodes: https://circuitcoders.com  (low density - very robust)\n"
    )
    with open(os.path.join(out, "cc-card-README.txt"), "w") as f:
        f.write(readme)
    print("  wrote cc-card-README.txt")


if __name__ == "__main__":
    print("Building Circuit Coders laser-engrave artwork...")
    main()
    print("Done.")
