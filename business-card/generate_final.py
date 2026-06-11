#!/usr/bin/env python3
"""
Single .3mf, 3 colors baked in, ready to print on Bambu H2C.
Every triangle tagged with its filament. Just hit print.
"""

import numpy as np
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os, zipfile, io, struct

CARD_W=85.6; CARD_H=54.0; BASE_THICK=1.5
TEXT_HEIGHT=1.0; QR_HEIGHT=1.0; PPM=10

# Colors: 0=black base, 1=purple TPU QR, 2=green PLA text
BLACK="1A1A1A"; PURPLE="8B00FF"; GREEN="00C853"

def box(x,y,z,w,d,h):
    v=[(x,y,z),(x+w,y,z),(x+w,y+d,z),(x,y+d,z),
       (x,y,z+h),(x+w,y,z+h),(x+w,y+d,z+h),(x,y+d,z+h)]
    t=[(0,3,1),(1,3,2),(4,5,7),(5,6,7),(0,1,5),(0,5,4),
       (2,3,7),(2,7,6),(0,4,7),(0,7,3),(1,2,6),(1,6,5)]
    return v,t

def bmp2box(bmp,ox,oy,z,ps,h):
    v,t,o=[],[],0
    r,c=bmp.shape
    for i in range(r):
        for j in range(c):
            if bmp[i,j]:
                bv,bt=box(ox+j*ps,oy+(r-1-i)*ps,z,ps,ps,h)
                v.extend(bv); t.extend([(a+o,b+o,c_+o) for a,b,c_ in bt]); o+=len(bv)
    return v,t

def rendertxt(text,sz,mw):
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

def genqr(data):
    qr=qrcode.QRCode(version=None,error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=1,border=0)
    qr.add_data(data); qr.make(fit=True)
    return np.array(qr.get_matrix(),dtype=np.uint8)

def build():
    """Returns list of (verts, tris, color_index)"""
    parts=[]; ps=1.0/PPM; cx=5.0

    # Base black
    parts.append((*box(0,0,0,CARD_W,CARD_H,BASE_THICK), 0))

    # QR purple
    qb=genqr("https://circuitcoders.com")
    qm=qb.shape[0]; ms=32.0/qm
    v,t=bmp2box(qb,CARD_W-32-5,(CARD_H-32)/2,BASE_THICK,ms,QR_HEIGHT)
    parts.append((v,t,1))
    print(f"  QR: {qm}x{qm}, {ms:.2f}mm/mod")

    # All text green
    def addtxt(v,t): parts.append((v,t,2))

    cb=rendertxt("CIRCUIT CODERS",5.0,50); cw,ch=cb.shape[1]*ps,cb.shape[0]*ps
    cy=CARD_H-5.0-ch; addtxt(*bmp2box(cb,cx,cy,BASE_THICK,ps,TEXT_HEIGHT))
    tb=rendertxt("Engineering Studio",2.8,50); ty=cy-1.5-tb.shape[0]*ps
    addtxt(*bmp2box(tb,cx,ty,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    dy=ty-3.0; addtxt(*box(cx,dy,BASE_THICK,42,0.5,TEXT_HEIGHT*0.4))
    nb=rendertxt("Leo Lebel",3.5,50); ny=dy-3.0-nb.shape[0]*ps
    addtxt(*bmp2box(nb,cx,ny,BASE_THICK,ps,TEXT_HEIGHT))
    tib=rendertxt("Founder",2.5,50); tiy=ny-1.5-tib.shape[0]*ps
    addtxt(*bmp2box(tib,cx,tiy,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    pb=rendertxt("(442) 297-8170",2.5,50); py=tiy-3.0-pb.shape[0]*ps
    addtxt(*bmp2box(pb,cx,py,BASE_THICK,ps,TEXT_HEIGHT*0.8))
    wb=rendertxt("circuitcoders.com",2.5,50); wy=py-1.5-wb.shape[0]*ps
    addtxt(*bmp2box(wb,cx,wy,BASE_THICK,ps,TEXT_HEIGHT*0.8))
    eb=rendertxt("admin@circuitcoders.com",2.2,50); ey=wy-1.5-eb.shape[0]*ps
    addtxt(*bmp2box(eb,cx,ey,BASE_THICK,ps,TEXT_HEIGHT*0.7))
    bx=cx+cw+2; by=cy+ch/2-2
    addtxt(*box(bx,by+3,BASE_THICK,3,0.8,TEXT_HEIGHT))
    addtxt(*box(bx+0.5,by+1.5,BASE_THICK,2,0.8,TEXT_HEIGHT))
    addtxt(*box(bx+1,by,BASE_THICK,3,0.8,TEXT_HEIGHT))
    bw,bh=0.6,TEXT_HEIGHT*0.35
    addtxt(*box(2,CARD_H-bw-1,BASE_THICK,CARD_W-4,bw,bh))
    addtxt(*box(2,1,BASE_THICK,CARD_W-4,bw,bh))
    addtxt(*box(1,2,BASE_THICK,bw,CARD_H-4,bh))
    addtxt(*box(CARD_W-1-bw,2,BASE_THICK,bw,CARD_H-4,bh))

    return parts

def write_3mf(parts, path):
    # Merge all verts into one list, track tri colors
    all_v=[]; all_t=[]; all_c=[]; off=0
    for v,t,c in parts:
        if not v: continue
        all_v.extend(v)
        all_t.extend([(a+off,b+off,c_+off) for a,b,c_ in t])
        all_c.extend([c]*len(t))
        off+=len(v)

    print(f"  {len(all_v)} verts, {len(all_t)} tris")

    # Write XML in chunks to manage memory
    buf = io.StringIO()
    buf.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    buf.write('<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n')
    buf.write('  <metadata name="Application">BambuStudio</metadata>\n')
    buf.write('  <resources>\n')
    buf.write('    <basematerials id="1">\n')
    buf.write(f'      <base name="1 Black PLA" displaycolor="#{BLACK}"/>\n')
    buf.write(f'      <base name="2 Purple TPU" displaycolor="#{PURPLE}"/>\n')
    buf.write(f'      <base name="3 Green PLA" displaycolor="#{GREEN}"/>\n')
    buf.write('    </basematerials>\n')
    buf.write('    <object id="2" type="model" pid="1" pindex="0">\n')
    buf.write('      <mesh>\n')
    buf.write('        <vertices>\n')
    for v in all_v:
        buf.write(f'          <vertex x="{v[0]:.3f}" y="{v[1]:.3f}" z="{v[2]:.3f}"/>\n')
    buf.write('        </vertices>\n')
    buf.write('        <triangles>\n')
    for i,t in enumerate(all_t):
        buf.write(f'          <triangle v1="{t[0]}" v2="{t[1]}" v3="{t[2]}" pid="1" p1="{all_c[i]}"/>\n')
    buf.write('        </triangles>\n')
    buf.write('      </mesh>\n')
    buf.write('    </object>\n')
    buf.write('  </resources>\n')
    buf.write('  <build>\n')
    buf.write('    <item objectid="2"/>\n')
    buf.write('  </build>\n')
    buf.write('</model>\n')

    model_xml = buf.getvalue()

    ct = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'
    rels = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'

    # Bambu config that maps basematerial indices to extruders
    cfg = '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n'
    cfg += '  <plate><metadata key="plater_id" value="1"/></plate>\n'
    cfg += '  <object id="2">\n'
    cfg += '    <metadata key="name" value="BusinessCard"/>\n'
    cfg += '    <metadata key="extruder" value="1"/>\n'
    cfg += '  </object>\n'
    cfg += '</config>'

    with zipfile.ZipFile(path,"w",zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", ct)
        z.writestr("_rels/.rels", rels)
        z.writestr("3D/3dmodel.model", model_xml)
        z.writestr("Metadata/plate_1.config", cfg)

    print(f"\n  Saved: {path} ({os.path.getsize(path)/1024/1024:.1f}MB)")

def main():
    d=os.path.dirname(os.path.abspath(__file__))
    print("Building Circuit Coders card...")
    parts=build()
    out=os.path.join(d,"circuit-coders-card.3mf")
    write_3mf(parts, out)
    print("\n  Filament 1 = Black PLA (base)")
    print("  Filament 2 = Purple TPU (QR)")
    print("  Filament 3 = Green PLA (text)")
    print("\n  Open → set 3 filaments in AMS → slice → print")

if __name__=="__main__": main()
