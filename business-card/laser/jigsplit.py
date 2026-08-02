#!/usr/bin/env python3
"""
Circuit Coders — split the 12-up laser jig into printable pieces.

Why this exists: the 12-up tray is 282.4 mm wide because it is sized to the
LASER area (310 x 250). The H2C's FDM plate is only 256 x 256, so the one-piece
cc-jig-12up.stl CANNOT be printed. This is not tunable -- three 86 mm cards need
258 mm of width before a single wall is added.

The fix is two trays that butt together sharing one wall:

    piece A (2 cols) 190.1 mm  +  piece B (1 col) 97.8 mm  -  5.5 mm shared wall
                                                          = 282.4 mm  (exact)

Butted, the pocket centers land on the same x as the one-piece jig
(48.9 / 141.2 / 233.5), so cc-jig.lac's overlay lines up unchanged. Both pieces
fit the plate. Print A and B, butt them left-to-right against a straight edge,
drop in 12 blanks, run cc-jig.lac.

    python3 jigsplit.py
"""

import os
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("jiggen", os.path.join(HERE, "jiggen.py"))
J = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(J)

PLATE_W, PLATE_H = 256.0, 256.0     # Bambu H2C build plate


def build_piece(path, cols):
    """A tray `cols` pockets wide and J.ROWS tall, same wall/pocket geometry as
    the one-piece jig so pieces butt seamlessly."""
    w = cols * J.POCKET_W + (cols + 1) * J.WALL
    h = J.JIG_H
    tris = J.box_tris(0, 0, 0, w, h, J.BASE_T)
    for c in range(cols + 1):
        tris += J.box_tris(c * (J.POCKET_W + J.WALL), 0, J.BASE_T,
                           J.WALL, h, J.WALL_H)
    for r in range(J.ROWS + 1):
        tris += J.box_tris(0, r * (J.POCKET_H + J.WALL), J.BASE_T,
                           w, J.WALL, J.WALL_H)
    J.write_stl(path, tris)
    return w, h, len(tris)


def main():
    pieces = [("cc-jig-12up-A-2col.stl", 2), ("cc-jig-12up-B-1col.stl", 1)]
    total_w = 0.0
    centers = []
    for name, cols in pieces:
        w, h, n = build_piece(os.path.join(HERE, name), cols)
        fits = w <= PLATE_W and h <= PLATE_H
        print(f"  wrote {name:26} {w:6.2f} x {h:6.2f} mm  {n:4d} tris  "
              f"plate: {'OK' if fits else 'TOO BIG'}")
        # pocket x-centers this piece contributes once butted at total_w
        for c in range(cols):
            centers.append(total_w + J.WALL + c * (J.POCKET_W + J.WALL) + J.POCKET_W / 2)
        total_w += w - J.WALL          # pieces share one wall

    combined = total_w + J.WALL
    print(f"\n  butted width : {combined:.2f} mm   (one-piece jig: {J.JIG_W:.2f} mm)")
    print(f"  pocket x     : {[round(c, 2) for c in centers]}")
    expect = [round(c, 2) for c, _ in J.pocket_centers()[:J.COLS]]
    print(f"  one-piece x  : {expect}")
    match = [round(c, 2) for c in centers] == expect and abs(combined - J.JIG_W) < 1e-6
    verdict = ("MATCHES the one-piece jig; cc-jig.lac aligns unchanged" if match
               else "*** MISMATCH -- do not run ***")
    print(f"  -> {verdict}")


if __name__ == "__main__":
    print("Splitting the 12-up jig into printable pieces...")
    main()
    print("Done.")
