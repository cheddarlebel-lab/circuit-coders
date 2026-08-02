import { createClient } from '@libsql/client';
import fs from 'fs';
const SCRATCH='/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';
const env={}; for (const fn of ['.env','.env.production','.env.local']){if(!fs.existsSync(fn))continue; for(const l of fs.readFileSync(fn,'utf8').split('\n')){const m=l.replace(/^export\s+/,'').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m){const v=m[2].trim().replace(/^["']|["']$/g,''); if(v)env[m[1]]=v;}}}
const db=createClient({url:env.TURSO_DATABASE_URL.replace(/^libsql:\/\//,'https://'),authToken:env.TURSO_AUTH_TOKEN});
const [product,file,segment]=process.argv.slice(2);
const rows=JSON.parse(fs.readFileSync(SCRATCH+'/'+file,'utf8'));
let ins=0,skip=0,em=0;
for(const r of rows){
  const ex=(await db.execute({sql:"SELECT id FROM outreach_prospects WHERE product=? AND lower(name)=lower(?) LIMIT 1",args:[product,r.name]})).rows[0];
  if(ex){skip++;continue;}
  const cn=r.contact_name?(r.title?`${r.contact_name} (${r.title})`:r.contact_name):null;
  const notes=r.note||r.web_weakness||(r.sig?`Independent · ${r.title||''} · ${r.sig}`:null);
  await db.execute({sql:`INSERT INTO outreach_prospects (product,name,contact_name,city,region,email,phone,website,segment,status,notes) VALUES (?,?,?,?,?,?,?,?,?, 'not_contacted', ?)`,
    args:[product,r.name,cn,r.city,r.state,r.email??null,r.phone??null,r.website??null,r.vertical||segment,notes]});
  ins++; if(r.email)em++;
}
console.log(`${product} <- ${file}: +${ins} (${em} w/email), skip ${skip}`);
