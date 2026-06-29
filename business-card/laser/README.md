# Circuit Coders — Laser-Engraved Business Cards (Bambu H2C / 40W laser)

Engrave-ready art + runbook for cutting/marking CC business cards on the Bambu
40W laser module. Regenerate everything with:

```bash
python3 lasergen.py
```

Card size: **85.6 × 54 mm** (standard CR80), 3 mm corner radius.

---

## Files

| File | What it is | Use for |
|---|---|---|
| **`cc-card-ENGRAVE.png`** | **The single card — IMPORT THIS.** Sized to the Bambu 86×54 black-aluminum blank, black = laser marks it (→ silver). Same as the DARK master below, named/sized to drop one blank on the bed (Temecula-Lanes style). | **One anodized-aluminum card** |
| `cc-card-PREVIEW.png` | Finished-look preview (silver on black). QR verified → circuitcoders.com. | See the result |
| `cc-laser-DARK-engrave.png` | Engrave master, **black = laser marks it**. QR is an ink-tile with body-colored modules (flips to a normal QR once the material inverts). | **Black anodized aluminum**, black acrylic — any stock where a mark goes *lighter* than the body |
| `cc-laser-LIGHT-engrave.png` | Engrave master, **black = laser marks it**. Standard QR polarity. | **Wood / bamboo / light acrylic** — any stock where a mark goes *darker* than the body |
| `cc-card-CUT.svg` | Rounded-rect outline, 1 unit = 1 mm. | Cutting card blanks out of wood/acrylic. **Not needed for metal** (buy pre-cut blanks). |
| `cc-preview-anodized.png` | Truthful preview — silver engrave on black anodized. | Show the client / pick a look |
| `cc-preview-anodized-green.png` | Preview on **green** anodized stock. | Brand-color variant |
| `cc-preview-wood.png` | Preview — char engrave on basswood. | Pick a look |

The convention everywhere: **black pixel = "laser marks this spot."** On black
anodized aluminum a mark turns bright silver (body stays black); on wood a mark
turns dark (body stays light). The QR is the only element that flips with the
material — that's why there are two masters. All three real-card previews were
QR-decode verified to `https://circuitcoders.com`.

---

## Recommended material: black anodized aluminum

It's the premium "metal card" look, it's *exactly* CC's identity (dark body +
bright accent), the 40W diode marks it crisp-silver in a single fast pass, and
it's permanent (the laser ablates the dye layer — won't rub off). Pre-cut
85 × 54 mm anodized blanks are cheap in bulk (~$0.30–0.70 each, 50–100 packs on
Amazon/AliExpress — search "anodized aluminum business card blanks 85x54").
A 40W diode **cannot cut aluminum**, so buy them pre-cut.

Want a hint of brand color? Use **green anodized** blanks (`cc-preview-anodized-green`)
— the body reads CC-green and the engrave reveals silver. You can't laser an
arbitrary green onto bare metal, so this is the only way to get the green accent
on a metal card.

Runner-up: **basswood or bamboo** blanks — warm, premium, and the 40W can both
engrave the art and cut the card outline from sheet stock (use `cc-card-CUT.svg`).

---

## Bambu Studio workflow (laser/cutter mode)

1. Switch the H2C to the **laser** toolhead; put it in **laser mode** in Bambu
   Studio and pick the **40W** module.
2. **Import** the right engrave master (`...-DARK` for metal, `...-LIGHT` for wood).
3. Set the object's real size to **85.6 × 54 mm** (lock aspect). Position it over
   where your blank sits on the bed — use the camera/framing/"frame" preview.
4. Engrave mode: **Threshold / fixed-power** (not grayscale dither) — the art is
   already pure black/white, so you want a clean on/off mark.
5. (Wood/acrylic only) Also import `cc-card-CUT.svg`, assign it to a **Cut**
   operation, and order it **after** the engrave.
6. **Always run a power/speed test square on a scrap of the same blank first.**
   Then run the job.

### Starting parameters (then dial in with a test grid)

> Diode-laser settings vary by batch, focus, and lens — treat these as a starting
> point and run a 5×5 power/speed matrix on a scrap blank before committing.

| Material | Operation | Power | Speed | Passes | Notes |
|---|---|---|---|---|---|
| Black/green anodized aluminum | Engrave (mark) | ~40% | ~300 mm/s | 1 | Focused; ablates dye → silver. Line interval ~0.05 mm. Low/no air assist. Cannot be cut. |
| Basswood / bamboo | Engrave | ~30–40% | ~250 mm/s | 1 | Air assist ON to keep edges clean |
| Basswood / bamboo (2–3 mm) | Cut | 100% | ~8–12 mm/s | 2–3 | Air assist ON; expect light edge char |
| Cast acrylic (black) | Engrave | ~25% | ~300 mm/s | 1 | **Cast only** — frosts white |
| Cast acrylic (3 mm) | Cut | 100% | ~10 mm/s | 3–4 | Air assist ON |

### Safety / hard rules
- **Never laser PVC, vinyl, or unknown plastic** — releases chlorine gas, ruins
  the machine and your lungs. Acrylic must be **cast acrylic** only.
- A 40W **diode** laser **marks** metal (anodized/coated), it does **not cut** it.
- Run with the enclosure closed, ventilation/exhaust on, and don't leave it
  unattended — laser jobs flare.

---

## Batching multiple cards per job
Lay several blanks on the bed, then in Bambu Studio **duplicate** the imported
art and drag each copy over a blank (use the camera framing to line them up).
Engrave-only metal jobs are fast, so a tray of blanks runs in one session.

## BambuSuite projects (open & engrave — exact Temecula settings)

`lacgen.py` builds ready-to-open BambuSuite `.lac` projects. The **aluminum**
projects are cloned from the (perfect) Temecula Lanes project so machine, material
and process are byte-identical = same proven quality. The **wood** projects read
Bambu's own per-material H2C-40W laser parameters straight from its installed
preset library (values never hardcoded) and graft them onto that same proven
process structure. Each card's size is set by an exact transform (no fragile
image-import DPI guessing). Add another wood by appending `(tag, "Bambu preset
name")` to the `WOODS` list in `lacgen.py`.

```bash
python3 lacgen.py
```

| File | Material | Art | What it is |
|---|---|---|---|
| `cc-card.lac` | Aluminium Office Card – Black | DARK | **Single 86×54 card**, centered — the Temecula-equivalent. Mark → silver. |
| `cc-jig.lac` | Aluminium Office Card – Black | DARK | **12-up jig overlay** (all 12 pockets) sized 270.4×231.7 mm (fits the H2C-40W laser area, **310×250 mm**: X 12–322, Y 38–288). Frame once over the printed jig, engrave all 12. |
| `cc-card-basswood.lac` | **3mm Basswood Plywood** | LIGHT | Single 86×54 card. Engrave **55% / 450 mm/s / 0.1 mm / 1 pass**; cut 100% / 16 mm/s. Pale, even grain. |
| `cc-jig-basswood.lac` | **3mm Basswood Plywood** | LIGHT | 12-up jig overlay (all 12 pockets), 270.4×231.7 mm. |
| `cc-card-sapele.lac` | **3mm Sapele Plywood** | LIGHT | Single 86×54 card — premium reddish rosewood grain. Engrave **10% / 120 mm/s / 0.1 mm / 1 pass** (sapele is darker/denser → far gentler than basswood); cut 100% / 10 mm/s. |
| `cc-jig-sapele.lac` | **3mm Sapele Plywood** | LIGHT | 12-up jig overlay (all 12 pockets), 270.4×231.7 mm. |

> All wood projects engrave a **dark char on the bare wood** (the design strokes
> burn dark; the card body stays natural wood). The QR polarity is already correct
> for light stock. Sapele's rosewood tone makes the dark engrave read as a rich
> two-tone; basswood is a brighter, higher-contrast pale look.

**Workflow:** double-click the `.lac` → it opens in BambuSuite with material +
process already set → position/frame over your blank(s) (use the camera grid) →
**Make** → run a test square on a scrap first → engrave. Glasses on, enclosure
closed, exhaust on.

### Plywood: cutting the card out of a sheet
Plywood is engrave **and** cut by the 40W (unlike metal, which is mark-only and
bought pre-cut). The `.lac` is engrave-only by design — the safe, verified part.
To also cut the card from a 3 mm sheet:
1. Open the wood project (`cc-card-sapele.lac` or `cc-card-basswood.lac`) — engrave
   already set.
2. **Import `cc-card-CUT.svg`** (1 unit = 1 mm, the 86×54 rounded-rect outline).
   Size it 86×54 mm and center it on the engraved card.
3. Assign the SVG object **LaserLineCut** and order it **after** the engrave. The
   cut value is already in each project's process (Bambu's calibrated value):
   **basswood 100% / 16 mm/s / 1 pass**, **sapele 100% / 10 mm/s / 1 pass** (denser
   → slower). Run a scrap cut-test first.

> Why SVG-import the cut instead of baking it into the `.lac`? The `.lac` vector
> format (`VectorPath`/`PathObject`) isn't a published schema — hand-writing path
> geometry risks a corrupt or mis-registered cut. BambuSuite's own SVG import
> builds the vector object natively and correctly, so the cut is one click and
> always geometrically exact. The engrave — the part that must be pixel-perfect —
> stays in the proven raster pipeline.

> The laser working area is **310×250 mm**, so the 3×4 jig (270×232) fits with
> margin. (BambuSuite's image *import* mis-reads PNG DPI and may warn "too
> large" — the `.lac` avoids that by setting the real-world size directly.)

## 12-up jig + connected overlay (engrave a whole tray at once)

`jiggen.py` builds a matched **jig + single connected overlay** so you load
blanks once and engrave all 12 in one job. Because the script designs the jig,
it knows every pocket coordinate exactly — the overlay is aligned by construction.

```bash
python3 jiggen.py
```

| File | What it is |
|---|---|
| `cc-jig-12up.stl` | Printable tray: 3×4 = **12 pockets**, outer **269.2 × 231.7 × 3.0 mm**. Baseplate 1.6 mm + 1.4 mm walls. Pockets are card + 0.4 mm clearance/side. Print on the H2C in one color (black PLA). |
| `cc-overlay-DARK.png` | **The connected engrave file** for anodized aluminum / dark stock — card arts on one canvas, sized to the jig (500 dpi, black = mark). Currently engraves **all 12 slots** (`ACTIVE_SLOTS = 12`). Set to any N (filled from the top down) to engrave fewer. |
| `cc-overlay-LIGHT.png` | Same, for wood / light stock. |
| `cc-overlay-PREVIEW.png` | Visual of the whole tray so you can eyeball it. |
| `cc-jig-pockets.txt` | Every pocket center in mm (origin = bottom-left corner) — for re-aiming the job or matching another jig. |

### Workflow
1. **Print `cc-jig-12up.stl`** on the H2C (FDM, black PLA, ~0.2 mm, light infill).
2. Drop a card blank into each pocket.
3. Set the H2C to **laser mode**, import the matching overlay
   (`cc-overlay-DARK.png` for anodized aluminum).
4. **Set the overlay object to 269.2 × 231.7 mm** (= the jig's outer size) and
   push both the physical jig and the overlay to the **same bed corner** so their
   outer rectangles coincide. The art then lands centered on every pocket.
5. Engrave settings = same as the single-card table above (anodized: ~40% / 300 mm/s / 1 pass).
   **Run a power/speed test on one scrap blank first.** Frame the job to confirm
   alignment before firing.

> ⚠ **Confirm the H2C laser work area fits 269 × 231 mm.** The jig is sized for an
> assumed ~320 × 300 mm area. If the laser reach is smaller, open `jiggen.py`,
> set `COLS, ROWS = 2, 3` (or `2, 2`), and rerun — the overlay re-tiles to match.

> **Matching your existing Studio jig instead:** the Studio was asleep when this
> was built, so this is a fresh self-consistent jig. To overlay onto a *different*
> physical jig, set `COLS/ROWS/CARD/CLEAR/WALL` (or the `pocket_centers` list) in
> `jiggen.py` to that jig's real geometry and rerun — one command re-aims everything.

## Editing the design
All content (name, title, phone, web, email, QR target) lives in the `CONTACT`
dict at the top of `lasergen.py`. Change it, rerun `python3 lasergen.py`, and all
masters + previews regenerate. Fonts: Helvetica Neue (falls back to Arial).
