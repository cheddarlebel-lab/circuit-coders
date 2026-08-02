#!/bin/bash
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
DUR=25
OUT="missed-call.mp4"
mkdir -p txt

# scenes: main | mainsize | accent | accentsize | start | end
scenes=(
"Your phone|104|just rang.|104|0.2|2.9"
"Nobody|104|answered.|104|2.9|5.4"
"That caller just|90|called the next shop.|72|5.4|8.8"
"1 in 4 calls go unanswered.|60|Most callers never call back.|56|8.8|12.4"
"Meet the|98|AI receptionist.|82|12.4|15.4"
"Every call answered.|74|24/7. It books the job.|66|15.4|18.9"
"Hear it live|82|(760) 546-9189|94|18.9|22.0"
"Free shop audit|74|circuitcoders.com/start|58|22.0|25.0"
)

fade(){ echo "if(lt(t,${1}+0.3)\,(t-${1})/0.3\,if(gt(t,${2}-0.3)\,(${2}-t)/0.3\,1))"; }
FILT=""
i=0
for s in "${scenes[@]}"; do
  IFS='|' read -r m ms a as st en <<< "$s"
  printf '%s' "$m" > "txt/m$i.txt"
  printf '%s' "$a" > "txt/a$i.txt"
  al="$(fade "$st" "$en")"
  FILT="${FILT}drawtext=fontfile='${F}':textfile='txt/m$i.txt':fontcolor=white:fontsize=${ms}:x=(w-text_w)/2:y=820:enable='between(t,${st},${en})':alpha='${al}',"
  FILT="${FILT}drawtext=fontfile='${F}':textfile='txt/a$i.txt':fontcolor=#00e68a:fontsize=${as}:x=(w-text_w)/2:y=965:enable='between(t,${st},${en})':alpha='${al}',"
  i=$((i+1))
done
FILT="${FILT}drawtext=fontfile='${F}':text='CIRCUITCODERS.COM':fontcolor=0x6cae9a:fontsize=30:x=(w-text_w)/2:y=1805,format=yuv420p"

ffmpeg -y -loglevel error -loop 1 -t $DUR -i base.png -vf "$FILT" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "BUILT $OUT"
