import { createClient } from '@libsql/client';
import fs from 'fs';
const SCRATCH='/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';
const env={}; for (const fn of ['.env','.env.production','.env.local']){if(!fs.existsSync(fn))continue; for(const l of fs.readFileSync(fn,'utf8').split('\n')){const m=l.replace(/^export\s+/,'').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m){const v=m[2].trim().replace(/^["']|["']$/g,''); if(v)env[m[1]]=v;}}}
const db=createClient({url:env.TURSO_DATABASE_URL.replace(/^libsql:\/\//,'https://'),authToken:env.TURSO_AUTH_TOKEN});
const rows=JSON.parse(fs.readFileSync(SCRATCH+'/dealer_groups.json','utf8'));
let ins=0,skip=0;
for(const g of rows){
  const ex=(await db.execute({sql:"SELECT id FROM outreach_prospects WHERE product='lothours' AND lower(name)=lower(?) LIMIT 1",args:[g.name]})).rows[0];
  if(ex){skip++;continue;}
  await db.execute({sql:`INSERT INTO outreach_prospects (product,name,contact_name,city,region,phone,website,segment,channel,status,notes) VALUES ('lothours',?,?,?,?,?,?, 'Dealer group','phone','not_contacted', ?)`,
    args:[g.name,`${g.contact_name} (${g.title})`,g.city,g.state,g.phone,g.website,`GROUP · ~${g.rooftops} rooftops · phone/LinkedIn target (no published email) · 1 sale = ${g.rooftops} stores`]});
  ins++;
}
const t=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours'")).rows[0].n;
console.log(`Groups: inserted ${ins} phone-targets, skipped ${skip}. LotHours total ${t}.`);
