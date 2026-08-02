#!/bin/bash
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LOGO=/Users/leolebel/clawd/circuit-coders/public/brand/logo-512.png
mkdir -p adtxt

# 1) Build 1080x1350 (4:5) branded base + a green CTA button (shape ops, no fonts)
magick -size 1080x1350 xc:'#070a09' \( -size 1080x1350 radial-gradient:'#0e3a2c'-'#070a09' \) -compose screen -composite \
  -fill '#00e68a' -draw "rectangle 0,0 1080,6" -draw "rectangle 0,1344 1080,1350" \
  \( "$LOGO" -resize 104x104 \) -gravity north -geometry +0+86 -composite base1350.png
magick -size 820x132 xc:none -fill '#00e68a' -draw "roundrectangle 0,0 819,131 32,32" button.png

# helper: render_ad <out> <h1> <h2> <sub> <btn> <phone>
render_ad() {
  local out="$1" h1="$2" h2="$3" sub="$4" btn="$5" phone="$6"
  printf '%s' "$h1"  > adtxt/h1.txt
  printf '%s' "$h2"  > adtxt/h2.txt
  printf '%s' "$sub" > adtxt/sub.txt
  printf '%s' "$btn" > adtxt/btn.txt
  printf '%s' "$phone" > adtxt/ph.txt
  magick base1350.png button.png -gravity north -geometry +0+905 -composite _adbase.png
  ffmpeg -y -loglevel error -i _adbase.png -vf "\
drawtext=fontfile='${F}':textfile='adtxt/h1.txt':fontcolor=white:fontsize=86:x=(w-text_w)/2:y=430,\
drawtext=fontfile='${F}':textfile='adtxt/h2.txt':fontcolor=#00e68a:fontsize=86:x=(w-text_w)/2:y=548,\
drawtext=fontfile='${F}':textfile='adtxt/sub.txt':fontcolor=0xcfe8df:fontsize=46:x=(w-text_w)/2:y=720,\
drawtext=fontfile='${F}':textfile='adtxt/btn.txt':fontcolor=0x05140f:fontsize=50:x=(w-text_w)/2:y=940,\
drawtext=fontfile='${F}':textfile='adtxt/ph.txt':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=1130,\
drawtext=fontfile='${F}':text='circuitcoders.com/start':fontcolor=0x6cae9a:fontsize=40:x=(w-text_w)/2:y=1235,\
format=yuv420p" -frames:v 1 "$out"
  echo "BUILT $out"
}

render_ad ad1-missedcall.png "Every missed call" "is a lost job." "Auto shops miss 1 in 4 calls." "Get your free shop audit" "Hear the AI answer   (760) 546-9189"
render_ad ad2-mapsgap.png    "Invisible on"      "Google Maps?"   "The top 3 get all the calls."  "See where you rank"      "Free audit   (760) 546-9189"
render_ad ad3-receptionist.png "Never miss"      "a call again."  "Answers 24/7. Books every job." "Hear it live now"        "Call it now   (760) 546-9189"
echo "DONE"
