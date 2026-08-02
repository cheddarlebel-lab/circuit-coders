#!/bin/bash
# Circuit Coders — video ad slate (2026-07-02). Kinetic text over base.png (carbon+green),
# 1080x1920, silent w/ baked captions, truthful copy (no fabricated stats). Same engine as gen.sh.
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
mkdir -p txt out

fade(){ echo "if(lt(t,${1}+0.3)\,(t-${1})/0.3\,if(gt(t,${2}-0.3)\,(${2}-t)/0.3\,1))"; }

# build <out> <dur>  — reads global `scenes` array (main|mainsize|accent|accentsize|start|end)
build(){
  local OUT="$1" DUR="$2" FILT="" i=0 s m ms a as st en al
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
  ffmpeg -y -loglevel error -loop 1 -t "$DUR" -i base.png -vf "$FILT" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
  echo "BUILT $OUT"
}

# ---- HERO: missed-call (regenerated, truthful — replaces the '1 in 4' stat) ----
scenes=(
"Your phone|104|just rang.|104|0.2|2.9"
"Nobody|104|answered.|104|2.9|5.4"
"That caller just|88|dialed the next shop.|66|5.4|8.8"
"After you close,|86|the calls keep coming.|60|8.8|12.4"
"Meet the|98|AI receptionist.|82|12.4|15.4"
"Answers 24/7.|74|Books the job. Texts you.|56|15.4|18.9"
"Hear it live|82|(760) 546-9189|94|18.9|22.0"
"Free shop audit|74|circuitcoders.com/start|56|22.0|25.0"
)
build "missed-call.mp4" 25

# ---- after-hours ----
scenes=(
"It's 7pm.|104|Your shop is closed.|64|0.2|3.0"
"Your best customer|72|is calling right now.|66|3.0|6.2"
"It rings.|100|Then voicemail.|84|6.2|9.2"
"They hang up|82|and call someone else.|60|9.2|12.4"
"Unless|104|something answers.|72|12.4|15.4"
"A 24/7 AI receptionist|60|that books the job.|66|15.4|18.9"
"Hear it now|82|(760) 546-9189|94|18.9|22.0"
"Free shop audit|74|circuitcoders.com/start|56|22.0|25.0"
)
build "out/after-hours.mp4" 25

# ---- near-me / maps ----
scenes=(
"Someone searched|74|body shop near me.|70|0.2|3.2"
"Three shops|94|showed up first.|76|3.2|6.2"
"You weren't|94|one of them.|90|6.2|9.2"
"That's where|88|the jobs go.|90|9.2|12.2"
"We put you|84|in the top 3.|82|12.2|15.2"
"Profile, reviews,|72|a site that ranks.|66|15.2|18.6"
"See where you rank|66|it's free|100|18.6|21.6"
"Free shop audit|74|circuitcoders.com/start|56|21.6|24.6"
)
build "out/near-me.mp4" 25

# ---- collision value ----
scenes=(
"One collision job|76|is worth thousands.|68|0.2|3.2"
"The call comes in.|76|Nobody picks up.|72|3.2|6.4"
"That's not|94|a missed call.|84|6.4|9.4"
"It's a|104|missed job.|96|9.4|12.4"
"Our AI answers|78|every call, 24/7.|70|12.4|15.6"
"Books it. Texts you|62|the details.|92|15.6|18.6"
"Hear it live|82|(760) 546-9189|94|18.6|21.8"
"Free shop audit|74|circuitcoders.com/start|56|21.8|24.8"
)
build "out/collision.mp4" 25

echo "DONE — slate in content-engine/ (missed-call.mp4) + out/"
