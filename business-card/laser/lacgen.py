#!/usr/bin/env python3
"""
Build BambuSuite .lac laser projects for the Circuit Coders card, cloned from
the (perfect) Temecula Lanes project so machine + material + process settings
are byte-identical = exact same quality.

Two material families:
  ALUMINUM  -> "Aluminium Office Card - Black"  (configs copied verbatim from the
               Temecula template; dark stock, mark goes SILVER -> use DARK art)
  WOOD      -> any Bambu plywood preset (basswood, sapele, ...). The material +
               H2C-40W process are read straight from Bambu's own installed preset
               (values never hardcoded) and grafted onto the proven Temecula
               process structure; light stock, mark chars DARK -> use LIGHT art.

Outputs:
  cc-card.lac           -> single 86x54 card, anodized aluminum (DARK art)
  cc-jig.lac            -> top-9 jig overlay, anodized aluminum (DARK art)
  cc-card-basswood.lac  -> single 86x54 card, 3mm Basswood Plywood (LIGHT art)
  cc-jig-basswood.lac   -> top-9 jig overlay, 3mm Basswood Plywood (LIGHT art)
  cc-card-sapele.lac    -> single 86x54 card, 3mm Sapele Plywood (LIGHT art)
  cc-jig-sapele.lac     -> top-9 jig overlay, 3mm Sapele Plywood (LIGHT art)

Open any in BambuSuite -> material/process already set -> Make -> engrave.
To CUT plywood cards from a sheet, import cc-card-CUT.svg into the same project
and assign it LaserLineCut (basswood @ H2C-40W: 100% / 16 mm/s / 1 pass).

    python3 lacgen.py
"""

import os
import io
import json
import copy
import zipfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SUITE = os.path.expanduser("~/Library/Application Support/Bambu Suite")
TEMPLATE = os.path.join(SUITE, "lane1-card-ENGRAVE.lac")
MATERIAL_LIB = os.path.join(SUITE, "preset2d/Material")

# H2C-40W laser working area (from the machine config): X 12..322, Y 38..288 mm
WA_X0, WA_Y0, WA_X1, WA_Y1 = 12.0, 38.0, 322.0, 288.0
WA_CX, WA_CY = (WA_X0 + WA_X1) / 2, (WA_Y0 + WA_Y1) / 2     # 167, 163

# files copied verbatim from the template (machine + package scaffolding —
# material-independent, so identical for every project)
SCAFFOLD = [
    "2D/entry.json",
    "Metadata2D/Bambu Lab H2C-40W.config",
    "[Content_Types].xml",
    "_rels/.rels",
]


def fmt(n):
    return f"{n:.6g}"


# ---------------------------------------------------------------- material specs
def aluminum_material():
    """Embedded config files for 'Aluminium Office Card - Black', taken verbatim
    from the proven Temecula template."""
    base = "Aluminium Office Card - Black"
    with zipfile.ZipFile(TEMPLATE) as tz:
        files = {
            f"Metadata2D/{base}.config": tz.read(f"Metadata2D/{base}.config"),
            f"Metadata2D/{base} Process @BBL H2C 40W.config":
                tz.read(f"Metadata2D/{base} Process @BBL H2C 40W.config"),
            f"Metadata2D/{base}.png": tz.read(f"Metadata2D/{base}.png"),
            f"Metadata2D/{base}_translation.json":
                tz.read(f"Metadata2D/{base}_translation.json"),
        }
    return {"name": base, "id": "B-YC-A-A-K0", "files": files}


def _deep_merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            _deep_merge(dst[k], v)
        else:
            dst[k] = v
    return dst


LASER_SECTIONS = ["LaserImageEngrave", "LaserFillEngrave",
                  "LaserLineEngrave", "LaserLineCut"]


def wood_material(preset_name):
    """Embedded config files for any Bambu plywood preset (e.g. '3mm Sapele
    Plywood'). The material fields and H2C-40W laser parameters are read STRAIGHT
    from Bambu's installed preset (never hardcoded): the @BBL H2C 40W process is
    merged over the @BBL H2 base it inherits to resolve every laser value, then
    grafted onto the complete, proven Temecula process structure so all
    machine-level fields stay valid."""
    pdir = os.path.join(MATERIAL_LIB, preset_name)
    fil = json.load(open(os.path.join(pdir, f"filament/{preset_name}.json")))
    mat_id = fil["material_id"]

    # --- material .config (preset filament fields + the extra fields the
    #     template material .config carries) ----------------------------------
    material_cfg = {
        "category": fil.get("category", "Wood"),
        "classVersion": 3,
        "description": fil.get("description", ""),
        "from": "project",
        "instantiation": True,
        "material_checkin_start_time": 600,
        "material_cutting_mat": fil.get("material_cutting_mat", "LIGHT_GRIP"),
        "material_flammability": fil.get("material_flammability", "M2"),
        "material_id": mat_id,
        "material_process_feature": fil.get("material_process_feature", 0),
        "material_processing_modes": 1,
        "material_rotary_height": 0,
        "material_rotary_length": 0,
        "material_rotary_radius": 0,
        "material_support_comp": fil.get("material_support_comp", "SUPPORT_COMP_BLADE"),
        "material_thickness": fil.get("material_thickness", 3.0),
        "material_vendor": fil.get("material_vendor", "BambuLab"),
        "name": preset_name,
        "type": "filament",
        "vendor": "Global",
        "version": "00.00.00.01",
    }

    # --- resolve the preset's H2C-40W laser values (H2C 40W merged over @BBL H2)
    base = json.load(open(os.path.join(
        pdir, f"process/{preset_name} Process @BBL H2.json")))
    h2c = json.load(open(os.path.join(
        pdir, f"process/{preset_name} Process @BBL H2C 40W.json")))
    resolved = {}
    for sec in LASER_SECTIONS:
        merged = dict(base.get(sec, {}))
        merged.update(h2c.get(sec, {}))
        if merged:
            resolved[sec] = merged

    # Bambu's single-pass cut is optimistic for a real 3mm hardwood board on a
    # 40W diode (assumes perfect focus + dead-flat stock + clean lens). Strengthen
    # it: multiple passes + a touch slower so it severs cleanly with margin.
    # Multi-pass is the reliable way to cut 3mm on a diode (one slow pass over-chars
    # one edge). Tune CUT_PASSES / the speed factor if your board still tabs.
    CUT_PASSES = 3
    CUT_SPEED_FACTOR = 0.8     # 20% slower than Bambu's 1-pass value
    if "LaserLineCut" in resolved:
        cut = resolved["LaserLineCut"]
        cut["number_of_passes"] = CUT_PASSES
        cut["max_power"] = 100
        if "speed" in cut:
            cut["speed"] = round(cut["speed"] * CUT_SPEED_FACTOR)

    # --- process .config: clone the template's full H2C-40W process, graft the
    #     resolved laser values onto it ----------------------------------------
    with zipfile.ZipFile(TEMPLATE) as tz:
        proc = json.loads(tz.read(
            "Metadata2D/Aluminium Office Card - Black Process @BBL H2C 40W.config"))
    _deep_merge(proc, resolved)
    proc["name"] = f"{preset_name} Process @BBL H2C 40W"
    proc["compatible_materials"] = [preset_name]
    proc["compatible_printers"] = ["Bambu Lab H2C-40W"]
    proc["process_type"] = "LaserImageEngrave"
    proc["process_types"] = ["LaserFillEngrave", "LaserLineEngrave",
                             "LaserImageEngrave", "LaserLineCut"]

    # real material swatch
    mat_png = open(os.path.join(pdir, f"filament/{preset_name}.png"), "rb").read()

    translation = {
        "languages_version": 1,
        "multi_langs": {
            preset_name: {"en": preset_name},
            material_cfg["description"]: {"en": material_cfg["description"]},
        },
    }

    files = {
        f"Metadata2D/{preset_name}.config": json.dumps(material_cfg, indent=4).encode(),
        f"Metadata2D/{preset_name} Process @BBL H2C 40W.config":
            json.dumps(proc, indent=4).encode(),
        f"Metadata2D/{preset_name}.png": mat_png,
        f"Metadata2D/{preset_name}_translation.json":
            json.dumps(translation, indent=4).encode(),
    }
    return {"name": preset_name, "id": mat_id, "files": files,
            "image_engrave": resolved.get("LaserImageEngrave", {}),
            "line_cut": resolved.get("LaserLineCut", {})}


# ---------------------------------------------------------------- .lac builder
def build_lac(out_path, image_path, material, card_w_mm, card_h_mm,
              cols=1, rows=1, pitch_x=None, pitch_y=None):
    img = Image.open(image_path)
    iw, ih = img.size
    sx, sy = card_w_mm / iw, card_h_mm / ih          # px -> mm scale
    n = cols * rows
    obj_png = os.path.basename(image_path)

    pitch_x = pitch_x if pitch_x else card_w_mm
    pitch_y = pitch_y if pitch_y else card_h_mm
    span_w = (cols - 1) * pitch_x + card_w_mm
    span_h = (rows - 1) * pitch_y + card_h_mm
    x0 = WA_CX - span_w / 2
    y0 = WA_CY - span_h / 2

    objs, comps, plate_comps, obj_settings = [], [], [], []
    oid = 101
    for r in range(rows):
        for c in range(cols):
            tx = x0 + c * pitch_x
            ty = y0 + r * pitch_y
            comps.append({"obj_id": oid,
                          "transform": f"{fmt(sx)} 0 0 {fmt(sy)} {fmt(tx)} {fmt(ty)}"})
            objs.append({
                "color": "33 150 243 255",
                "file_name": obj_png,
                "flags": ["FreeAspectRatio"],
                "height": ih,
                "image_settings": {"classVersion": 3,
                                   "flags": ["RequireModifiesOnLoad"]},
                "name": os.path.splitext(obj_png)[0],
                "obj_id": oid,
                "type": "RasterImage",
                "width": iw,
            })
            plate_comps.append({"obj_id": oid,
                                "transform": f"1 0 0 1 {fmt(tx - WA_X0)} {fmt(ty - WA_Y0)}"})
            obj_settings.append({"obj_id": oid, "process_type": "LaserImageEngrave"})
            oid += 1

    model = {
        "Application": "Bambu Suite", "FileVersion": "01.03.00.00",
        "canvas_list": [{"components": comps, "index": 1, "name": "",
                         "obj_list": objs, "type_count": {}}],
    }
    settings = {
        "canvas_settings": [{
            "index": 1,
            "making_batch_list": [{
                "auto_arranged": (n > 1),
                "batch_settings": {"classVersion": 3, "processing_mode": "PLANE"},
                "making_plate_list": [{"components": plate_comps, "name": "",
                                       "obj_id": 14, "plate_mirror": False,
                                       "plate_settings": {"classVersion": 3}}],
                "material_id": material["id"], "material_name": material["name"],
                "material_settings_name": material["name"], "name": "",
                "obj_id": 10, "process_category": 1,
            }],
            "object_settings": obj_settings,
        }],
        "project_settings": {"classVersion": 3,
                             "machine_settings_name": "Bambu Lab H2C-40W",
                             "version": None},
    }

    thumb = img.convert("RGB").copy()
    thumb.thumbnail((512, 512))
    tbuf = io.BytesIO(); thumb.save(tbuf, "PNG")

    with zipfile.ZipFile(TEMPLATE) as tz, zipfile.ZipFile(out_path, "w",
                                                          zipfile.ZIP_DEFLATED) as z:
        for m in SCAFFOLD:
            z.writestr(m, tz.read(m))
        for arc, data in material["files"].items():
            z.writestr(arc, data)
        z.writestr("2D/2dmodel.json", json.dumps(model, indent=4))
        z.writestr("Metadata2D/project_settings.json", json.dumps(settings, indent=4))
        with open(image_path, "rb") as f:
            z.writestr(f"2D/Objects/{obj_png}", f.read())
        z.writestr("2D/design_thumbnail.png", tbuf.getvalue())
    return n, iw, ih, sx


# wood presets to build: (short file tag, Bambu preset name)
WOODS = [
    ("basswood", "3mm Basswood Plywood"),
    ("sapele", "3mm Sapele Plywood"),
]


def main():
    # jig overlay outer size — pulled from jiggen so it tracks the card spacing
    import importlib.util
    _spec = importlib.util.spec_from_file_location("jiggen", os.path.join(HERE, "jiggen.py"))
    _jg = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_jg)
    JIG_W, JIG_H = round(_jg.JIG_W, 1), round(_jg.JIG_H, 1)  # fits 310x250 laser area
    DARK = os.path.join(HERE, "cc-laser-DARK-engrave.png")
    LIGHT = os.path.join(HERE, "cc-laser-LIGHT-engrave.png")
    OV_DARK = os.path.join(HERE, "cc-overlay-DARK.png")
    OV_LIGHT = os.path.join(HERE, "cc-overlay-LIGHT.png")

    # 1. anodized aluminum — DARK art (mark -> silver)
    alu = aluminum_material()
    _, iw, ih, sx = build_lac(os.path.join(HERE, "cc-card.lac"), DARK, alu, 86.0, 54.0)
    print(f"  wrote cc-card.lac            (aluminum, 1 card, img {iw}x{ih}, scale {sx:.5f} -> 86x54mm)")
    build_lac(os.path.join(HERE, "cc-jig.lac"), OV_DARK, alu, JIG_W, JIG_H)
    print(f"  wrote cc-jig.lac             (aluminum, top-9 overlay -> {JIG_W}x{JIG_H}mm)")

    # 2. wood plywoods — LIGHT art (mark -> dark char)
    for tag, preset in WOODS:
        w = wood_material(preset)
        ie, lc = w["image_engrave"], w["line_cut"]
        build_lac(os.path.join(HERE, f"cc-card-{tag}.lac"), LIGHT, w, 86.0, 54.0)
        build_lac(os.path.join(HERE, f"cc-jig-{tag}.lac"), OV_LIGHT, w, JIG_W, JIG_H)
        print(f"  wrote cc-card-{tag}.lac / cc-jig-{tag}.lac"
              f"  ({preset}: engrave {ie.get('max_power')}%/{ie.get('speed')}mm·s, "
              f"cut {lc.get('max_power')}%/{lc.get('speed')}mm·s)")

    # tidy: remove the old ambiguous wood file names from the basswood-only build
    for stale in ("cc-card-wood.lac", "cc-jig-wood.lac"):
        p = os.path.join(HERE, stale)
        if os.path.exists(p):
            os.remove(p)
            print(f"  removed stale {stale}")


if __name__ == "__main__":
    main()
    print("Done.")
