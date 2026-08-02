#!/usr/bin/env python3
# Circuit Coders — premium motion-graphics ad engine (2026-07-06).
# Designed frames (animated glow, eased kinetic type, story motifs) -> ffmpeg encode. No AI b-roll.
import os, sys, math, subprocess, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG  = "/System/Library/Fonts/Supplemental/Arial.ttf"
GREEN = (0, 230, 138); OFFW = (233, 243, 239); MUTE = (108, 174, 154); DARK = (5, 20, 15)
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)

_fc = {}
def font(path, sz):
    k = (path, sz)
    if k not in _fc: _fc[k] = ImageFont.truetype(path, sz)
    return _fc[k]

def eoc(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3          # ease-out-cubic
def eio(t):                                                              # ease-in-out
    t = max(0.0, min(1.0, t)); return 4*t*t*t if t < .5 else 1 - (-2*t+2)**3/2
def c01(t): return max(0.0, min(1.0, t))

# ---- precomputed assets ----
def make_glow(size=1100, col=GREEN):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.sqrt((xx-size/2)**2 + (yy-size/2)**2) / (size/2)
    a = np.clip(1-r, 0, 1) ** 2.4
    arr = np.zeros((size, size, 4), np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = col
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")
GLOW = make_glow()

def make_base():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32); base[:] = (7, 10, 9)       # carbon
    # faint vertical sheen
    base += (np.clip(1 - abs(yy/H - .42)*1.3, 0, 1)[..., None]) * np.array([2, 9, 7], np.float32)
    # vignette
    r = np.sqrt(((xx-W/2)/(W/2))**2 + ((yy-H/2)/(H/2))**2)
    vig = np.clip((r - .55)/.6, 0, 1) ** 1.6
    base *= (1 - vig[..., None] * .55)
    return base
BASE = make_base()
LOGO = Image.open("public.png") if os.path.exists("public.png") else None
try:
    LOGO = Image.open("/Users/leolebel/clawd/circuit-coders/public/brand/logo-512.png").convert("RGBA").resize((150, 150))
except Exception:
    LOGO = None

def ctext(d, cx, y, text, fnt, fill, a=255):
    if not text or a <= 0: return
    w = d.textlength(text, font=fnt)
    im = Image.new("RGBA", (int(w)+8, fnt.size+24), (0,0,0,0))
    ImageDraw.Draw(im).text((4, 4), text, font=fnt, fill=fill+(int(a),))
    d._image.alpha_composite(im, (int(cx - w/2), int(y)))

def line_anim(d, cx, ybase, text, fnt, fill, t, t_in, t_out, maxw=980):
    """slide-up + fade in, fade out. Auto-shrinks font so text never overflows."""
    while fnt.size > 26 and d.textlength(text, font=fnt) > maxw:
        fnt = font(fnt.path, fnt.size - 4)
    ain = eoc((t - t_in)/.55); slide = (1-ain)*48
    aout = 1 - c01((t - (t_out-.35))/.35)
    a = min(ain, aout) * 255
    if a <= 1: return
    ctext(d, cx, ybase + slide, text, fnt, fill, a)

def draw_rings(d, cx, cy, t, t0, col, phase_speed=1.0, n=3):
    """expanding concentric rings (incoming call)."""
    for i in range(n):
        ph = ((t - t0)*phase_speed + i/n) % 1.0
        rad = 40 + ph*230
        a = int((1-ph) * 150)
        if a <= 2: continue
        bb = [cx-rad, cy-rad, cx+rad, cy+rad]
        d.ellipse(bb, outline=col+(a,), width=6)

def draw_wave(d, cx, cy, t, amp=1.0, col=GREEN, bars=13, bw=12, gap=20):
    """animated equalizer (AI speaking)."""
    total = bars*bw + (bars-1)*gap; x0 = cx - total/2
    for i in range(bars):
        h = (0.35 + 0.65*abs(math.sin(t*6.0 + i*0.7))) * 150 * amp
        x = x0 + i*(bw+gap)
        d.rounded_rectangle([x, cy-h/2, x+bw, cy+h/2], radius=bw/2, fill=col+(230,))

def draw_check(d, cx, cy, p, col=GREEN, R=90):
    """checkmark drawing on, p=0..1 reveal + settle."""
    scale = 0.6 + 0.4*eoc(p)
    a = int(min(1, p*2)*255)
    d.ellipse([cx-R, cy-R, cx+R, cy+R], outline=col+(a,), width=8)
    # check path
    p1 = (cx-38, cy+4); p2 = (cx-8, cy+34); p3 = (cx+44, cy-30)
    rev = c01((p-0.15)/0.6)
    seg1 = min(1, rev*2); seg2 = max(0, rev*2-1)
    def lerp(a_, b_, s): return (a_[0]+(b_[0]-a_[0])*s, a_[1]+(b_[1]-a_[1])*s)
    if seg1 > 0: d.line([p1, lerp(p1,p2,seg1)], fill=col+(255,), width=12)
    if seg2 > 0: d.line([p2, lerp(p2,p3,seg2)], fill=col+(255,), width=12)

def draw_browser(d, cx, cy, p, content=0.0):
    """browser frame drawing on; content = 0..1 fills body lines."""
    w, hh = 620, 420; a = int(eoc(p)*230)
    if a <= 2: return
    x0, y0 = cx-w/2, cy-hh/2
    rev = eoc(p)
    d.rounded_rectangle([x0, y0, x0+w, y0+hh], radius=26, outline=GREEN+(a,), width=5)
    d.line([x0+6, y0+64, x0+w-6, y0+64], fill=GREEN+(int(a*0.6),), width=3)   # top bar
    for i,cxx in enumerate((x0+40, x0+72, x0+104)):
        d.ellipse([cxx-8, y0+22, cxx+8, y0+38], fill=GREEN+(a,))
    # body content lines slide/fill
    lines = [(0.55,120),(0.8,180),(0.45,240),(0.7,300)]
    for j,(lw,ly) in enumerate(lines):
        cp = c01((content - j*0.12)/0.5)
        if cp<=0: continue
        col = OFFW if j==0 else MUTE
        d.rounded_rectangle([x0+40, y0+ly, x0+40+ (w-80)*lw*eoc(cp), y0+ly+ (26 if j==0 else 16)],
                            radius=8, fill=col+(int(a*0.85),))

def draw_ranks(d, cx, cy, t, you_at, appear):
    """3 ranked bars; 'you' bar rises to top over `appear` 0..1."""
    labels_y = [cy-120, cy, cy+120]
    for i in range(3):
        yy = labels_y[i]
        top3 = True
        base_w = [520, 430, 360][i]
        is_you = False
        col = GREEN if i < 3 else MUTE
        a = int(eoc(c01((t)/1.0))*255)
    # simpler: three bars, top one green highlighted, a 4th grey 'you' rises
    W3 = [560, 470, 400]; ys = [cy-140, cy, cy+140]
    for i in range(3):
        gp = eoc(c01((t-0.2-i*0.15)/0.6))
        d.rounded_rectangle([cx-280, ys[i]-34, cx-280 + W3[i]*gp, ys[i]+34], radius=16,
                            fill=(GREEN if i==0 else (26,54,44))+(230,))
    # 'you' bar: starts at bottom short/grey, rises to #1 green
    rise = eio(appear)
    yy = ys[2] + (ys[0]-ys[2])*rise
    ww = 300 + (560-300)*rise
    r,g,b = (int(26+(0-26)*rise), int(54+(230-54)*rise), int(44+(138-44)*rise))
    d.rounded_rectangle([cx-280, yy-34, cx-280+ww, yy+34], radius=16, outline=(0,230,138,255), width=5,
                        fill=(r,g,b,150))

def button(d, cx, cy, text, fnt, p=1.0):
    w, h = 640, 130; a = int(eoc(p)*255)
    if a <= 2: return
    ov = Image.new("RGBA", (W, H), (0,0,0,0)); od = ImageDraw.Draw(ov)
    od.rounded_rectangle([cx-w/2, cy-h/2, cx+w/2, cy+h/2], radius=34, fill=GREEN+(a,))
    tw = od.textlength(text, font=fnt)
    od.text((cx-tw/2, cy-fnt.size/2-6), text, font=fnt, fill=DARK+(a,))
    d._image.alpha_composite(ov)

def render(spec, out, seconds):
    tmp = "/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad/vf"
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    nframes = int(seconds*FPS)
    h1f = font(BOLD, 96); h2f = font(BOLD, 96); subf = font(REG, 46)
    bigf = font(BOLD, 82); btnf = font(BOLD, 50); footf = font(REG, 40)
    rng = np.random.default_rng(7)
    for fi in range(nframes):
        t = fi / FPS
        # background + animated glow
        img = Image.fromarray(BASE.astype(np.uint8), "RGB").convert("RGBA")
        gx = W/2 + math.sin(t*0.6)*70; gy = 760 + math.cos(t*0.5)*60
        gs = int(1000 + math.sin(t*0.8)*90); go = int(150 + 70*math.sin(t*0.7))
        gl = GLOW.resize((gs, gs)); gl = Image.eval(gl, lambda v: v)  # keep
        gla = gl.split()[3].point(lambda v: int(v*go/255))
        gl.putalpha(gla)
        img.alpha_composite(gl, (int(gx-gs/2), int(gy-gs/2)))
        d = ImageDraw.Draw(img)
        if LOGO:
            lg = LOGO.copy(); img.alpha_composite(lg, (W//2-75, 150))
        spec(d, img, t)  # scene content
        # grain
        arr = np.asarray(img.convert("RGB")).astype(np.int16)
        arr += rng.integers(-6, 7, (H, W, 1), dtype=np.int16)
        Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f"{tmp}/f{fi:04d}.png")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),"-i",f"{tmp}/f%04d.png",
                    "-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart",
                    "-vf","format=yuv420p", out], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print("BUILT", out)

# ---------- HERO: missed call -> AI answers -> booked ----------
def hero(d, img, t):
    h1 = font(BOLD, 96); sub = font(REG, 48); big = font(BOLD, 132); btn = font(BOLD, 50); foot = font(REG, 40)
    CX = W/2
    # S1 0.0-3.4  incoming call
    if 0.0 <= t < 3.6:
        draw_rings(d, CX, 720, t, 0.0, GREEN, 1.1, 3)
        pr = 40 + 6*math.sin(t*6)                      # gently pulsing core
        d.ellipse([CX-pr, 720-pr, CX+pr, 720+pr], fill=GREEN+(255,))
        line_anim(d, CX, 1080, "A customer", h1, OFFW, t, 0.5, 3.5)
        line_anim(d, CX, 1200, "is calling.", h1, GREEN, t, 0.7, 3.5)
    # S2 3.4-6.6 missed / voicemail
    if 3.4 <= t < 6.8:
        draw_rings(d, CX, 700, t, 3.4, (120,130,125), 0.5, 2)
        line_anim(d, CX, 980,  "You're under a car.", sub, MUTE, t, 3.7, 6.7)
        line_anim(d, CX, 1080, "It goes to", h1, OFFW, t, 3.9, 6.7)
        line_anim(d, CX, 1200, "voicemail.", h1, OFFW, t, 4.05, 6.7)
    # S3 6.6-9.6  lost job
    if 6.6 <= t < 9.8:
        line_anim(d, CX, 860,  "That job just went", h1, OFFW, t, 6.9, 9.7)
        line_anim(d, CX, 980,  "to the shop", h1, OFFW, t, 7.05, 9.7)
        line_anim(d, CX, 1100, "down the street.", h1, GREEN, t, 7.2, 9.7)
    # S4 9.6-12.8 the AI answers (soundwave)
    if 9.6 <= t < 13.0:
        amp = eoc((t-9.8)/0.8)
        draw_wave(d, CX, 720, t, amp)
        line_anim(d, CX, 1000, "Now every call", h1, OFFW, t, 9.9, 12.9)
        line_anim(d, CX, 1120, "gets answered. 24/7.", sub, MUTE, t, 10.1, 12.9)
    # S5 12.8-15.8 booked
    if 12.8 <= t < 16.0:
        draw_check(d, CX, 720, c01((t-13.0)/1.1))
        line_anim(d, CX, 1000, "It books the job", h1, OFFW, t, 13.2, 15.9)
        line_anim(d, CX, 1120, "and texts you.", sub, MUTE, t, 13.4, 15.9)
    # S6 15.8-20 CTA
    if t >= 15.8:
        line_anim(d, CX, 620, "Hear the AI answer", h1, OFFW, t, 16.0, 99)
        line_anim(d, CX, 760, "a real call, live:", sub, MUTE, t, 16.15, 99)
        line_anim(d, CX, 900, "(760) 546-9189", big, GREEN, t, 16.35, 99)
        button(d, CX, 1230, "Free shop audit", btn, c01((t-16.7)/0.5))
        line_anim(d, CX, 1360, "circuitcoders.com", foot, MUTE, t, 16.9, 99)

# ---------- WEBSITES ----------
def websites(d, img, t):
    h1 = font(BOLD, 96); sub = font(REG, 48); big = font(BOLD, 120); btn = font(BOLD, 50); foot = font(REG, 40)
    CX = W/2
    if 0.0 <= t < 3.8:
        draw_browser(d, CX, 660, eoc(c01((t-0.2)/0.9)), 0.0)
        line_anim(d, CX, 1080, "Your website", h1, OFFW, t, 0.5, 3.7)
        line_anim(d, CX, 1200, "is your storefront.", h1, GREEN, t, 0.7, 3.7)
    if 3.8 <= t < 7.0:
        line_anim(d, CX, 940,  "A drag-and-drop", h1, OFFW, t, 4.0, 6.9)
        line_anim(d, CX, 1060, "template", h1, OFFW, t, 4.12, 6.9)
        line_anim(d, CX, 1180, "won't cut it.", h1, GREEN, t, 4.25, 6.9)
    if 7.0 <= t < 10.8:
        draw_browser(d, CX, 640, 1.0, c01((t-7.2)/1.6))
        line_anim(d, CX, 1040, "We build custom.", h1, OFFW, t, 7.3, 10.7)
        line_anim(d, CX, 1160, "Fast. It ranks. You own it.", sub, MUTE, t, 7.5, 10.7)
    if t >= 10.8:
        line_anim(d, CX, 700, "Live in 7 days.", h1, OFFW, t, 11.0, 99)
        line_anim(d, CX, 880, "From $1,500", big, GREEN, t, 11.25, 99)
        button(d, CX, 1180, "Start a project", btn, c01((t-11.6)/0.5))
        line_anim(d, CX, 1320, "circuitcoders.com", foot, MUTE, t, 11.8, 99)

# ---------- LOCAL SEO / MAPS ----------
def local(d, img, t):
    h1 = font(BOLD, 96); sub = font(REG, 48); btn = font(BOLD, 50); foot = font(REG, 40)
    CX = W/2
    if 0.0 <= t < 3.4:
        line_anim(d, CX, 940,  "Someone searched", sub, MUTE, t, 0.4, 3.3)
        line_anim(d, CX, 1030, "body shop", h1, OFFW, t, 0.6, 3.3)
        line_anim(d, CX, 1150, "near me.", h1, GREEN, t, 0.75, 3.3)
    if 3.4 <= t < 7.0:
        draw_ranks(d, CX, 660, t-3.4, 0, 0.0)
        line_anim(d, CX, 1120, "Three shops get all the calls.", sub, MUTE, t, 4.4, 6.9)
    if 7.0 <= t < 10.4:
        line_anim(d, CX, 940,  "You're not", h1, OFFW, t, 7.2, 10.3)
        line_anim(d, CX, 1060, "one of them.", h1, GREEN, t, 7.35, 10.3)
    if 10.4 <= t < 14.0:
        draw_ranks(d, CX, 660, 2.0, 0, eio(c01((t-10.7)/2.2)))
        line_anim(d, CX, 1120, "We put you in the top 3.", h1, OFFW, t, 11.0, 13.9)
    if t >= 14.0:
        line_anim(d, CX, 760, "See where you rank", h1, OFFW, t, 14.2, 99)
        line_anim(d, CX, 900, "free, no obligation", sub, MUTE, t, 14.35, 99)
        button(d, CX, 1140, "Get found on Google", btn, c01((t-14.7)/0.5))
        line_anim(d, CX, 1290, "circuitcoders.com", foot, MUTE, t, 14.9, 99)

# ---------- DEMO LINE (native hook: "call this number") ----------
def demo(d, img, t):
    h1 = font(BOLD, 96); sub = font(REG, 48); big = font(BOLD, 128); btn = font(BOLD, 50); foot = font(REG, 40)
    CX = W/2
    # S1 0.0-3.9  the hook: call this number
    if 0.0 <= t < 3.9:
        draw_rings(d, CX, 690, t, 0.0, GREEN, 1.1, 3)
        pr = 40 + 6*math.sin(t*6)
        d.ellipse([CX-pr, 690-pr, CX+pr, 690+pr], fill=GREEN+(255,))
        line_anim(d, CX, 1010, "Call this number.", h1, OFFW, t, 0.4, 3.8)
        line_anim(d, CX, 1150, "(760) 546-9189", big, GREEN, t, 0.7, 3.8)
    # S2 3.7-7.1  it's our AI receptionist (soundwave)
    if 3.7 <= t < 7.1:
        amp = eoc((t-3.9)/0.8)
        draw_wave(d, CX, 700, t, amp)
        line_anim(d, CX, 1000, "That's our", h1, OFFW, t, 4.0, 7.0)
        line_anim(d, CX, 1120, "AI receptionist.", h1, GREEN, t, 4.15, 7.0)
    # S3 6.9-10.3  answers, books, texts (check)
    if 6.9 <= t < 10.3:
        draw_check(d, CX, 700, c01((t-7.1)/1.1))
        line_anim(d, CX, 1000, "It answers 24/7,", h1, OFFW, t, 7.3, 10.2)
        line_anim(d, CX, 1120, "books the job, texts you.", sub, MUTE, t, 7.5, 10.2)
    # S4 10.1-13.3  never miss a job
    if 10.1 <= t < 13.3:
        line_anim(d, CX, 940,  "So the shop", h1, OFFW, t, 10.3, 13.2)
        line_anim(d, CX, 1060, "never misses", h1, OFFW, t, 10.45, 13.2)
        line_anim(d, CX, 1180, "another job.", h1, GREEN, t, 10.6, 13.2)
    # S5 13.1-  CTA
    if t >= 13.1:
        line_anim(d, CX, 720, "Hear it yourself:", h1, OFFW, t, 13.3, 99)
        line_anim(d, CX, 880, "(760) 546-9189", big, GREEN, t, 13.5, 99)
        button(d, CX, 1200, "Free shop audit", btn, c01((t-13.9)/0.5))
        line_anim(d, CX, 1345, "circuitcoders.com", foot, MUTE, t, 14.1, 99)

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    jobs = [("hero", hero, 20.0), ("websites", websites, 16.0), ("local", local, 19.0), ("demo", demo, 16.0)]
    for name, fn, secs in jobs:
        if which in ("all", name):
            render(fn, f"out/videos/{name}.mp4", secs)
