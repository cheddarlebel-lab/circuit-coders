#!/bin/bash
# Circuit Coders — service-selling ad bank (2026-07-06). 14 image ads (1080x1350, 4:5),
# full catalog, truthful copy, proven carbon+green template. Same engine as gen_ads_v2.sh.
set -e
cd "$(dirname "$0")"
F="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LOGO=/Users/leolebel/clawd/circuit-coders/public/brand/logo-512.png
mkdir -p adtxt out/services

magick -size 1080x1350 xc:'#070a09' \( -size 1080x1350 radial-gradient:'#0e3a2c'-'#070a09' \) -compose screen -composite \
  -fill '#00e68a' -draw "rectangle 0,0 1080,6" -draw "rectangle 0,1344 1080,1350" \
  \( "$LOGO" -resize 104x104 \) -gravity north -geometry +0+86 -composite base1350.png
magick -size 820x132 xc:none -fill '#00e68a' -draw "roundrectangle 0,0 819,131 32,32" button.png

# render_ad <out> <h1white> <h2green> <sub> <btn> <line5white> <footergreen>  (pure ImageMagick — ffmpeg is dep-broken)
render_ad() {
  magick base1350.png button.png -gravity north -geometry +0+905 -composite \
    -font "$F" -gravity north \
    -pointsize 84 -fill white     -annotate +0+430 "$2" \
    -pointsize 84 -fill "#00e68a" -annotate +0+546 "$3" \
    -pointsize 42 -fill "#cfe8df" -annotate +0+716 "$4" \
    -pointsize 48 -fill "#05140f" -annotate +0+948 "$5" \
    -pointsize 44 -fill white     -annotate +0+1132 "$6" \
    -pointsize 38 -fill "#6cae9a" -annotate +0+1236 "$7" \
    "out/services/$1"
  echo "BUILT $1"
}

render_ad web-sells.png     "Your website"      "should sell for you."  "Custom-built, live in 7 days."      "Start a project"    "From \$1,500"      "circuitcoders.com"
render_ad web-template.png  "Template sites"    "don't rank."           "We build custom. You own it all."   "Get a real site"    "From \$1,500"      "circuitcoders.com"
render_ad maps.png          "Invisible on"      "Google Maps?"          "We get you into the top 3."         "See where you rank" "Free audit"        "circuitcoders.com"
render_ad reviews.png       "They have"         "more reviews."         "That's the game. Let's fix it."      "Rank on Google"     "\$199 + \$149/mo"  "circuitcoders.com"
render_ad receptionist.png  "Never miss"        "a call again."         "An AI that answers 24/7."           "Hear it live"       "(760) 546-9189"    "circuitcoders.com"
render_ad webapp.png        "Got an idea"       "for an app?"           "Full-stack: auth, data, payments."  "Build it"           "From \$2,500"      "circuitcoders.com"
render_ad automation.png    "Still doing it"    "by hand?"              "We automate the busywork."          "Put AI to work"     "Custom AI"         "circuitcoders.com"
render_ad ecommerce.png     "Sell online"       "the right way."        "Stripe checkout, subs, orders."     "Build your store"   "From \$2,500"      "circuitcoders.com"
render_ad mobile.png        "Your app,"         "on every phone."       "Native iOS and Android, shipped."   "Build your app"     "iOS + Android"     "circuitcoders.com"
render_ad value.png         "Big-agency work."  "Solo-shop price."      "See it before you pay a dollar."    "Start a project"    "Fixed price"       "circuitcoders.com"
render_ad oneteam.png       "Websites to AI."   "One team."             "Custom software for local biz."     "See our work"       "Built by one team" "circuitcoders.com"
render_ad autoshop.png      "Auto shops:"       "never miss a job."     "AI phone + reviews + Google."       "Free shop audit"    "(760) 546-9189"    "circuitcoders.com"
render_ad branding.png      "A brand"           "they remember."        "Logos, sites, 3D-printed cards."    "Get noticed"        "Branding + print"  "circuitcoders.com"
render_ad speed.png         "Live in"           "7 days."               "Custom site, no templates."         "Get started"        "Fixed price"       "circuitcoders.com"

echo "DONE — 14 service ads in out/services/"
