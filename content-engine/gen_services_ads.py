#!/usr/bin/env python3
# Circuit Coders — service ad bank (14 ads, 1080x1350). PIL renderer (ffmpeg/magick fonts broken).
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
os.makedirs("out/services", exist_ok=True)
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
base = Image.open("base1350.png").convert("RGBA")
button = Image.open("button.png").convert("RGBA")
_fc = {}
def font(sz):
    if sz not in _fc: _fc[sz] = ImageFont.truetype(FONT, sz)
    return _fc[sz]
def ctext(d, y, text, sz, color):
    if not text: return
    f = font(sz)
    w = d.textlength(text, font=f)
    d.text(((1080 - w) / 2, y), text, font=f, fill=color)

# (out, h1 white, h2 green, sub, button, line5 white, footer green)
ADS = [
 ("web-sells.png",    "Your website",     "should sell for you.", "Custom-built, live in 7 days.",     "Start a project",    "From $1,500",     "circuitcoders.com"),
 ("web-template.png", "Template sites",   "don't rank.",          "We build custom. You own it all.",  "Get a real site",    "From $1,500",     "circuitcoders.com"),
 ("maps.png",         "Invisible on",     "Google Maps?",         "We get you into the top 3.",        "See where you rank", "Free audit",      "circuitcoders.com"),
 ("reviews.png",      "They have",        "more reviews.",        "That's the game. Let's fix it.",    "Rank on Google",     "$199 + $149/mo",  "circuitcoders.com"),
 ("receptionist.png", "Never miss",       "a call again.",        "An AI that answers 24/7.",          "Hear it live",       "(760) 546-9189",  "circuitcoders.com"),
 ("webapp.png",       "Got an idea",      "for an app?",          "Full-stack: auth, data, payments.", "Build it",           "From $2,500",     "circuitcoders.com"),
 ("automation.png",   "Still doing it",   "by hand?",             "We automate the busywork.",         "Put AI to work",     "Custom AI",       "circuitcoders.com"),
 ("ecommerce.png",    "Sell online",      "the right way.",       "Stripe checkout, subs, orders.",    "Build your store",   "From $2,500",     "circuitcoders.com"),
 ("mobile.png",       "Your app,",        "on every phone.",      "Native iOS and Android, shipped.",  "Build your app",     "iOS + Android",   "circuitcoders.com"),
 ("value.png",        "Big-agency work.", "Solo-shop price.",     "See it before you pay a dollar.",   "Start a project",    "Fixed price",     "circuitcoders.com"),
 ("oneteam.png",      "Websites to AI.",  "One team.",            "Custom software for local biz.",    "See our work",       "Built by one team","circuitcoders.com"),
 ("autoshop.png",     "Auto shops:",      "never miss a job.",    "AI phone + reviews + Google.",      "Free shop audit",    "(760) 546-9189",  "circuitcoders.com"),
 ("branding.png",     "A brand",          "they remember.",       "Logos, sites, 3D-printed cards.",   "Get noticed",        "Branding + print","circuitcoders.com"),
 ("speed.png",        "Live in",          "7 days.",              "Custom site, no templates.",        "Get started",        "Fixed price",     "circuitcoders.com"),
]

WHITE=(255,255,255); GREEN="#00e68a"; SUB="#cfe8df"; DARK="#05140f"; FOOT="#6cae9a"
for out,h1,h2,sub,btn,l5,ft in ADS:
    img = base.copy()
    img.alpha_composite(button, (130, 905))          # 820-wide button centered, y=905
    d = ImageDraw.Draw(img)
    ctext(d, 430,  h1,  84, WHITE)
    ctext(d, 546,  h2,  84, GREEN)
    ctext(d, 716,  sub, 42, SUB)
    ctext(d, 946,  btn, 48, DARK)
    ctext(d, 1132, l5,  44, WHITE)
    ctext(d, 1236, ft,  38, FOOT)
    img.convert("RGB").save(os.path.join("out/services", out), "PNG")
    print("BUILT", out)
print("DONE — %d service ads in out/services/" % len(ADS))
