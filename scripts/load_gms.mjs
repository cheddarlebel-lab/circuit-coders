import { createClient } from '@libsql/client';
import fs from 'fs';
const SCRATCH='/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';
const env={}; for (const fn of ['.env','.env.production','.env.local']){if(!fs.existsSync(fn))continue; for(const l of fs.readFileSync(fn,'utf8').split('\n')){const m=l.replace(/^export\s+/,'').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m){const v=m[2].trim().replace(/^["']|["']$/g,''); if(v)env[m[1]]=v;}}}
const db=createClient({url:env.TURSO_DATABASE_URL.replace(/^libsql:\/\//,'https://'),authToken:env.TURSO_AUTH_TOKEN});
const gms=JSON.parse(fs.readFileSync(SCRATCH+'/dealer_gms.json','utf8'));
let ins=0,upd=0;
for(const g of gms){
  const notes=`GM outreach · ${g.title}`;
  const ex=(await db.execute({sql:"SELECT id,email,status FROM outreach_prospects WHERE product='lothours' AND lower(name)=lower(?) LIMIT 1",args:[g.name]})).rows[0];
  if(ex){
    // upgrade existing dealer with named GM contact + email (only if not already contacted on this email)
    await db.execute({sql:"UPDATE outreach_prospects SET contact_name=?, email=COALESCE(NULLIF(email,''),?), notes=COALESCE(notes,'')||?, website=COALESCE(website,?) WHERE id=?",args:[g.contact_name, g.email, ' · '+notes, g.website, ex.id]});
    // if it had no email before and was not_contacted, set the GM email
    if(!ex.email) await db.execute({sql:"UPDATE outreach_prospects SET email=? WHERE id=?",args:[g.email,ex.id]});
    upd++;
  } else {
    await db.execute({sql:`INSERT INTO outreach_prospects (product,name,contact_name,city,region,email,phone,website,segment,status,notes) VALUES ('lothours',?,?,?,?,?,?,?,?, 'not_contacted', ?)`,
      args:[g.name,g.contact_name,g.city,g.state,g.email,g.phone,g.website,'Dealership · GM',notes]});
    ins++;
  }
}
const t=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours'")).rows[0].n;
const em=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours' AND email IS NOT NULL AND email<>'' AND status='not_contacted'")).rows[0].n;
console.log(`GMs: inserted ${ins}, updated ${upd}. LotHours total ${t}, emailable+uncontacted ${em}.`);
