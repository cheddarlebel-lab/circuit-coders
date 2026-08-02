#!/bin/bash
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LOGO=/Users/leolebel/clawd/circuit-coders/public/brand/logo-512.png
SRC=broll_src.png
OUT=cinematic-ad.mp4
DUR=11
mkdir -p ctxt

printf '%s' "After hours. Shop closed."        > ctxt/h1.txt
printf '%s' "The AI still answers."             > ctxt/h2.txt
printf '%s' "AI RECEPTIONIST FOR YOUR SHOP"     > ctxt/label.txt
printf '%s' "Hear it live   (760) 546-9189"     > ctxt/phone.txt

# fade helpers
F1S=0.6; F1E=5.0
F2S=5.0; F2E=10.6
PS=2.6   # persistent lower-third start
a1="if(lt(t,${F1S}+0.4)\,(t-${F1S})/0.4\,if(gt(t,${F1E}-0.4)\,(${F1E}-t)/0.4\,1))"
a2="if(lt(t,${F2S}+0.4)\,(t-${F2S})/0.4\,1)"
ap="if(lt(t,${PS})\,0\,if(lt(t,${PS}+0.5)\,(t-${PS})/0.5\,1))"

ffmpeg -y -loglevel error -loop 1 -i "$SRC" -i "$LOGO" -filter_complex "\
[0:v]scale=1080:1350,zoompan=z='min(zoom+0.0004\,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*30)):s=1080x1350:fps=30,setsar=1[bg];\
[1:v]scale=92:92[lg];\
[bg][lg]overlay=(W-w)/2:60[v0];\
[v0]drawtext=fontfile='${F}':textfile='ctxt/h1.txt':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=235:enable='between(t,${F1S},${F1E})':alpha='${a1}'[v1];\
[v1]drawtext=fontfile='${F}':textfile='ctxt/h2.txt':fontcolor=#00e68a:fontsize=72:x=(w-text_w)/2:y=235:enable='gte(t,${F2S})':alpha='${a2}'[v2];\
[v2]drawtext=fontfile='${F}':textfile='ctxt/label.txt':fontcolor=0xcfe8df:fontsize=40:x=(w-text_w)/2:y=1060:alpha='${ap}'[v3];\
[v3]drawtext=fontfile='${F}':textfile='ctxt/phone.txt':fontcolor=#00e68a:fontsize=54:x=(w-text_w)/2:y=1130:alpha='${ap}'[v4];\
[v4]drawtext=fontfile='${F}':text='circuitcoders.com/start':fontcolor=0x6cae9a:fontsize=40:x=(w-text_w)/2:y=1225:alpha='${ap}',format=yuv420p[vout]" \
-map "[vout]" -t $DUR -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "BUILT $OUT"
