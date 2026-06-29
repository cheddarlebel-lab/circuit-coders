CIRCUIT CODERS - metal QR business card
=======================================
Material : Bambu Lab Black Aluminum Card  86 x 54 x 0.4 mm
           (laser ablates dye -> bright silver)
Machine  : Bambu H2C, 40W laser, Bambu Suite

FILES
  cc-card-ENGRAVE.png  <- IMPORT THIS. Fits the 86x54 card. Black = engrave->silver.
  cc-card-PREVIEW.png  <- Finished look (QR verified -> https://circuitcoders.com).

BAMBU SUITE
  1. New laser project. Import cc-card-ENGRAVE.png.
  2. Process type: Laser Image (raster) engrave.
  3. Size to the Bambu card: 86 x 54 mm. Wipe the blank clean first.
  4. Place blank flat on bed (magnets/tape). Run auto-focus / height probe.
  5. Glasses on, enclosure closed, exhaust on.

SETTINGS (black anodized - go LOW power, it ablates easily)
  Fill/raster: ~30-45% power, ~400-700 mm/s, 1 pass, line interval 0.05-0.06 mm.
  >>> Run a small power/speed TEST SQUARE in a corner first. Tune for bright,
      crisp silver. Too much power blooms edges and softens the QR.

QR encodes: https://circuitcoders.com  (low density - very robust)
