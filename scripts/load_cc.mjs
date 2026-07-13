import { createClient } from '@libsql/client';
import fs from 'fs';
const SCRATCH='/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';
const env={}; for (const fn of ['.env','.env.production','.env.local']){if(!fs.existsSync(fn))continue; for(const l of fs.readFileSync(fn,'utf8').split('\n')){const m=l.replace(/^export\s+/,'').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m){const v=m[2].trim().replace(/^["']|["']$/g,''); if(v)env[m[1]]=v;}}}
const db=createClient({url:env.TURSO_DATABASE_URL.replace(/^libsql:\/\//,'https://'),authToken:env.TURSO_AUTH_TOKEN});
const files=process.argv.slice(2);
let ins=0,skip=0,em=0;
for(const f of files){
  const arr=JSON.parse(fs.readFileSync(SCRATCH+'/'+f,'utf8'));
  for(const p of arr){
    const dupe=(await db.execute({sql:"SELECT id FROM outreach_prospects WHERE product='circuit_coders' AND lower(name)=lower(?) LIMIT 1",args:[p.name]})).rows;
    if(dupe.length){skip++;continue;}
    await db.execute({sql:`INSERT INTO outreach_prospects (product,name,city,region,email,phone,website,segment,status,notes) VALUES ('circuit_coders',?,?,?,?,?,?,?, 'not_contacted', ?)`,
      args:[p.name,p.city,p.state,p.email??null,p.phone??null,p.website??null,p.vertical??'Local business',p.web_weakness??null]});
    ins++; if(p.email)em++;
  }
}
const t=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='circuit_coders'")).rows[0].n;
const emt=(await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='circuit_coders' AND email IS NOT NULL AND email<>'' AND status='not_contacted'")).rows[0].n;
console.log(`CC: inserted ${ins} (${em} w/email), skipped ${skip}. CC total ${t}, emailable+uncontacted ${emt}.`);
