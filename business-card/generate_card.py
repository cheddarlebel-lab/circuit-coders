#!/usr/bin/env python3
"""Single STL — base + QR + text all in one file, stacked correctly."""

import numpy as np
from stl import mesh
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

CARD_W=85.6; CARD_H=54.0; BASE_THICK=1.5; TEXT_HEIGHT=1.0; QR_HEIGHT=1.0; PPM=10

def make_box(x,y,z,w,d,h):
    v=np.array([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])
    f=np.array([[0,3,1],[1,3,2],[4,5,7],[5,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]])
    return v,f

def bmp2box(bmp,ox,oy,z,ps,h):
    av,af,o=[],[],0
    r,c=bmp.shape
    for i in range(r):
        for j in range(c):
            if bmp[i,j]:
                v,f=make_box(ox+j*ps,oy+(r-1-i)*ps,z,ps,ps,h)
                av.append(v); af.append(f+o); o+=len(v)
    return (np.vstack(av),np.vstack(af)) if av else (np.zeros((0,3)),np.zeros((0,3),dtype=int))

def txt(text,sz,mw):
    px=int(sz*PPM); font=None
    for fp in ["/System/Library/Fonts/Menlo.ttc","/System/Library/Fonts/Monaco.dfont"]:
        if os.path.exists(fp):
            try: font=ImageFont.truetype(fp,px); break
            except: pass
    if not font: font=ImageFont.load_default()
    tmp=Image.new("L",(int(mw*PPM)*2,px*3),0)
    bb=ImageDraw.Draw(tmp).textbbox((0,0),text,font=font)
    tw,th=bb[2]-bb[0],bb[3]-bb[1]
    img=Image.new("L",(tw+4,th+4),0)
    ImageDraw.Draw(img).text((-bb[0]+2,-bb[1]+2),text,fill=255,font=font)
    return (np.array(img)>128).astype(np.uint8)

def combine(parts):
    av,af,o=[],[],0
    for v,f in parts:
        if len(v)==0: continue
        av.append(v); af.append(f+o); o+=len(v)
    return np.vstack(av),np.vstack(af)

def main():
    d=os.path.dirname(os.path.abspath(__file__))
    ps=1.0/PPM; cx=5.0; parts=[]

    # BASE
    parts.append(make_box(0,0,0,CARD_W,CARD_H,BASE_THICK))

    # QR on top of base
    qr=qrcode.QRCode(version=None,error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=1,border=0)
    qr.add_data("https://circuitcoders.com"); qr.make(fit=True)
    qb=np.array(qr.get_matrix(),dtype=np.uint8)
    qm=qb.shape[0]; ms=32.0/qm
    parts.append(bmp2box(qb,CARD_W-32-5,(CARD_H-32)/2,BASE_THICK,ms,QR_HEIGHT))

    # TEXT on top of base
    cb=txt("CIRCUIT CODERS",5.0,50); cw,ch=cb.shape[1]*ps,cb.shape[0]*ps
    cy=CARD_H-5.0-ch; parts.append(bmp2box(cb,cx,cy,BASE_THICK,ps,TEXT_HEIGHT))
    tb=txt("Engineering Studio",2.8,50); ty=cy-1.5-tb.shape[0]*ps
    parts.append(bmp2box(tb,cx,ty,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    dy=ty-3.0; parts.append(make_box(cx,dy,BASE_THICK,42,0.5,TEXT_HEIGHT*0.4))
    nb=txt("Leo Lebel",3.5,50); ny=dy-3.0-nb.shape[0]*ps
    parts.append(bmp2box(nb,cx,ny,BASE_THICK,ps,TEXT_HEIGHT))
    tib=txt("Founder",2.5,50); tiy=ny-1.5-tib.shape[0]*ps
    parts.append(bmp2box(tib,cx,tiy,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    pb=txt("(442) 297-8170",2.5,50); py=tiy-3.0-pb.shape[0]*ps
    parts.append(bmp2box(pb,cx,py,BASE_THICK,ps,TEXT_HEIGHT*0.8))
    wb=txt("circuitcoders.com",2.5,50); wy=py-1.5-wb.shape[0]*ps
    parts.append(bmp2box(wb,cx,wy,BASE_THICK,ps,TEXT_HEIGHT*0.8))
    eb=txt("admin@circuitcoders.com",2.2,50); ey=wy-1.5-eb.shape[0]*ps
    parts.append(bmp2box(eb,cx,ey,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    bx=cx+cw+2; by=cy+ch/2-2
    parts.append(make_box(bx,by+3,BASE_THICK,3,0.8,TEXT_HEIGHT))
    parts.append(make_box(bx+0.5,by+1.5,BASE_THICK,2,0.8,TEXT_HEIGHT))
    parts.append(make_box(bx+1,by,BASE_THICK,3,0.8,TEXT_HEIGHT))
    bw,bh=0.6,TEXT_HEIGHT*0.35
    parts.append(make_box(2,CARD_H-bw-1,BASE_THICK,CARD_W-4,bw,bh))
    parts.append(make_box(2,1,BASE_THICK,CARD_W-4,bw,bh))
    parts.append(make_box(1,2,BASE_THICK,bw,CARD_H-4,bh))
    parts.append(make_box(CARD_W-1-bw,2,BASE_THICK,bw,CARD_H-4,bh))

    av,af=combine(parts)
    m=mesh.Mesh(np.zeros(len(af),dtype=mesh.Mesh.dtype))
    for i,face in enumerate(af):
        for j in range(3): m.vectors[i][j]=av[face[j]]

    out=os.path.join(d,"circuit-coders-card.stl")
    m.save(out)
    print(f"Saved: {out}")
    print(f"{len(af):,} triangles, one solid piece")
    print(f"\nBase: 1.5mm, text/QR raised 1.0mm on top")
    print("Use color change at 1.5mm layer height in Bambu Studio")
    print("to switch from black to your raised colors.")

if __name__=="__main__": main()
