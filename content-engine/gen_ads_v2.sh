#!/bin/bash
# Circuit Coders — Meta ad creatives v2 (2026-07-01)
# Collision/auto vertical, truthful copy (no fabricated stats), current offer.
# Same proven template as gen_ads.sh: carbon #070a09 + green radial glow + CC lightning + green CTA.
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LOGO=/Users/leolebel/clawd/circuit-coders/public/brand/logo-512.png
mkdir -p adtxt out

# 1080x1350 (4:5, best Meta feed real estate) branded base + green CTA pill
magick -size 1080x1350 xc:'#070a09' \( -size 1080x1350 radial-gradient:'#0e3a2c'-'#070a09' \) -compose screen -composite \
  -fill '#00e68a' -draw "rectangle 0,0 1080,6" -draw "rectangle 0,1344 1080,1350" \
  \( "$LOGO" -resize 104x104 \) -gravity north -geometry +0+86 -composite base1350.png
magick -size 820x132 xc:none -fill '#00e68a' -draw "roundrectangle 0,0 819,131 32,32" button.png

# render_ad <out> <h1> <h2> <sub> <btn> <phone>
render_ad() {
  local out="$1" h1="$2" h2="$3" sub="$4" btn="$5" phone="$6"
  printf '%s' "$h1" > adtxt/h1.txt; printf '%s' "$h2" > adtxt/h2.txt
  printf '%s' "$sub" > adtxt/sub.txt; printf '%s' "$btn" > adtxt/btn.txt; printf '%s' "$phone" > adtxt/ph.txt
  magick base1350.png button.png -gravity north -geometry +0+905 -composite _adbase.png
  ffmpeg -y -loglevel error -i _adbase.png -vf "\
drawtext=fontfile='${F}':textfile='adtxt/h1.txt':fontcolor=white:fontsize=86:x=(w-text_w)/2:y=430,\
drawtext=fontfile='${F}':textfile='adtxt/h2.txt':fontcolor=#00e68a:fontsize=86:x=(w-text_w)/2:y=548,\
drawtext=fontfile='${F}':textfile='adtxt/sub.txt':fontcolor=0xcfe8df:fontsize=44:x=(w-text_w)/2:y=720,\
drawtext=fontfile='${F}':textfile='adtxt/btn.txt':fontcolor=0x05140f:fontsize=50:x=(w-text_w)/2:y=940,\
drawtext=fontfile='${F}':textfile='adtxt/ph.txt':fontcolor=white:fontsize=46:x=(w-text_w)/2:y=1130,\
drawtext=fontfile='${F}':text='circuitcoders.com/start':fontcolor=0x6cae9a:fontsize=40:x=(w-text_w)/2:y=1235,\
format=yuv420p" -frames:v 1 "out/$out"
  echo "BUILT out/$out"
}

# HERO — missed call (truthful mechanism, no invented %)
render_ad ad-missedcall.png "The call you miss" "goes down the street." "After hours, it finally gets answered." "Get your free shop audit" "Hear the AI live   (760) 546-9189"

# COLLISION-specific — ties missed call to real ticket value (defensible)
render_ad ad-collision.png "A collision job" "is worth thousands." "Miss the call, miss the job." "Free shop audit" "Hear it now   (760) 546-9189"

# AFTER-HOURS / 24-7 receptionist
render_ad ad-afterhours.png "Your best customer" "called at 7pm." "The AI books it while you're closed." "Hear it live now" "Call it   (760) 546-9189"

# MAPS GAP — local search
render_ad ad-mapsgap.png "Not in the top 3" "on Google Maps?" "That is where the calls go." "See where you rank - free" "Free audit   (760) 546-9189"

echo "DONE — 4 creatives in out/"
