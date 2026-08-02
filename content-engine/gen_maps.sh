#!/bin/bash
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
DUR=23
OUT="maps-gap.mp4"
mkdir -p txt_maps

# scenes: main | mainsize | accent | accentsize | start | end  (no commas/colons/apostrophes in text)
scenes=(
"Type into Google|84|auto repair near me|74|0.2|2.8"
"Are you in|100|the top 3?|104|2.8|5.2"
"If not|104|you are invisible.|80|5.2|7.6"
"Nobody scrolls|86|to page 2.|100|7.6|10.2"
"Those jobs go to|80|your competitors.|80|10.2|13.0"
"Your Google listing|76|is probably half-built.|68|13.0|16.0"
"We fix it and|86|get you on the map.|74|16.0|19.2"
"Free Google audit|80|circuitcoders.com/start|58|19.2|23.0"
)

fade(){ echo "if(lt(t,${1}+0.3)\,(t-${1})/0.3\,if(gt(t,${2}-0.3)\,(${2}-t)/0.3\,1))"; }
FILT=""
i=0
for s in "${scenes[@]}"; do
  IFS='|' read -r m ms a as st en <<< "$s"
  printf '%s' "$m" > "txt_maps/m$i.txt"
  printf '%s' "$a" > "txt_maps/a$i.txt"
  al="$(fade "$st" "$en")"
  FILT="${FILT}drawtext=fontfile='${F}':textfile='txt_maps/m$i.txt':fontcolor=white:fontsize=${ms}:x=(w-text_w)/2:y=820:enable='between(t,${st},${en})':alpha='${al}',"
  FILT="${FILT}drawtext=fontfile='${F}':textfile='txt_maps/a$i.txt':fontcolor=#00e68a:fontsize=${as}:x=(w-text_w)/2:y=965:enable='between(t,${st},${en})':alpha='${al}',"
  i=$((i+1))
done
FILT="${FILT}drawtext=fontfile='${F}':text='CIRCUITCODERS.COM':fontcolor=0x6cae9a:fontsize=30:x=(w-text_w)/2:y=1805,format=yuv420p"

ffmpeg -y -loglevel error -loop 1 -t $DUR -i base.png -vf "$FILT" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "BUILT $OUT"
