#!/bin/bash
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
DUR=23
OUT="ai-demo.mp4"
mkdir -p dtxt

# scene: label | labelcolor | line | linecolor | linesize | start | end   (empty label = skip)
scenes=(
"|white|What our AI sounds like|white|74|0.3|3.0"
"CALLER|0x9aa6a2|Do you do brake jobs?|white|72|3.0|6.0"
"AI ANSWERS|#00e68a|I can get you in at 9 tomorrow.|#00e68a|62|6.0|9.8"
"CALLER|0x9aa6a2|Its a 2019 Silverado.|white|72|9.8|12.6"
"AI ANSWERS|#00e68a|Booked. Ill text you a confirmation.|#00e68a|58|12.6|16.4"
"|white|That is our AI front desk.|white|68|16.4|19.2"
"Hear it live|white|(760) 546-9189|#00e68a|90|19.2|23.0"
)
# (lines with apostrophes are written via textfile so they render correctly)
declare -a fixline=( "" "" "" "It's a 2019 Silverado." "Booked. I'll text you a confirmation." "That's our AI front desk." "" )

fade(){ echo "if(lt(t,${1}+0.35)\,(t-${1})/0.35\,if(gt(t,${2}-0.35)\,(${2}-t)/0.35\,1))"; }
FILT=""
i=0
for s in "${scenes[@]}"; do
  IFS='|' read -r lbl lblc line linec lsize st en <<< "$s"
  [ -n "${fixline[$i]}" ] && line="${fixline[$i]}"
  printf '%s' "$lbl"  > "dtxt/l$i.txt"
  printf '%s' "$line" > "dtxt/t$i.txt"
  al="$(fade "$st" "$en")"
  if [ -n "$lbl" ]; then
    FILT="${FILT}drawtext=fontfile='${F}':textfile='dtxt/l$i.txt':fontcolor=${lblc}:fontsize=36:x=(w-text_w)/2:y=815:enable='between(t,${st},${en})':alpha='${al}',"
  fi
  FILT="${FILT}drawtext=fontfile='${F}':textfile='dtxt/t$i.txt':fontcolor=${linec}:fontsize=${lsize}:x=(w-text_w)/2:y=905:enable='between(t,${st},${en})':alpha='${al}',"
  i=$((i+1))
done
FILT="${FILT}drawtext=fontfile='${F}':text='circuitcoders.com/start':fontcolor=0x6cae9a:fontsize=30:x=(w-text_w)/2:y=1805,format=yuv420p"

ffmpeg -y -loglevel error -loop 1 -t $DUR -i base.png -vf "$FILT" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "BUILT $OUT"
