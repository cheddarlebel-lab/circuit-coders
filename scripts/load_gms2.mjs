import { createClient } from '@libsql/client';
import fs from 'fs';
const SCRATCH='/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';
const env={}; for (const fn of ['.env','.env.production','.env.local']){if(!fs.existsSync(fn))continue; for(const l of fs.readFileSync(fn,'utf8').split('\n')){const m=l.replace(/^export\s+/,'').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m){const v=m[2].trim().replace(/^["']|["']$/g,''); if(v)env[m[1]]=v;}}}
const db=createClient({url:env.TURSO_DATABASE_URL.replace(/^libsql:\/\//,'https://'),authToken:env.TURSO_AUTH_TOKEN});
const raw=JSON.parse(fs.readFileSync(SCRATCH+'/dealer_leads_uncovered_metros_20260713.json','utf8'));
// dedupe to one contact per dealership, preferring decision-maker titles, requiring an email
const PRI=t=>{t=(t||'').toLowerCase();
  if(t.includes('general manager'))return 0; if(t.includes('dealer principal'))return 1; if(t.includes('owner'))return 2;
  if(t.includes('general sales'))return 3; if(t.includes('fixed op'))return 4; if(t.includes('controller'))return 5;
  if(t.includes('office manager'))return 6; return 7;};
const best={};
for(const r of raw){ if(!r.contact_email)continue; const k=r.dealership_name.toLowerCase();
  if(!best[k]||PRI(r.title)<PRI(best[k].title)) best[k]=r; }
const gms=Object.values(best);
let ins=0,upd=0;
for(const g of gms){
  const notes=`GM outreach · ${g.title}`;
  const ex=(await db.execute({sql:"SELECT id,email FROM outreach_prospects WHERE product='lothours' AND lower(name)=lower(?) LIMIT 1",args:[g.dealership_name]})).rows[0];
  if(ex){
    await db.execute({sql:"UPDATE outreach_prospects SET contact_name=COALESCE(contact_name,?), email=COALESCE(NULLIF(email,''),?), website=COALESCE(website,?) WHERE id=?",args:[g.contact_name,g.contact_email,g.website,ex.id]});
    upd++;
  } else {
    await db.execute({sql:`INSERT INTO outreach_prospects (product,name,contact_name,city,region,email,phone,website,segment,status,notes) VALUES ('lothours',?,?,?,?,?,?,?, 'Dealership · GM','not_contacted', ?)`,
      args:[g.dealership_name,g.contact_name,g.city,g.state,g.contact_email,g.phone,g.website,notes]});
    ins++;
  }
}
const t=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours'")).rows[0].n;
const em=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours' AND email IS NOT NULL AND email<>'' AND status='not_contacted'")).rows[0].n;
console.log(`GM batch2: ${gms.length} unique dealerships -> inserted ${ins}, updated ${upd}. LotHours total ${t}, emailable+uncontacted ${em}.`);
