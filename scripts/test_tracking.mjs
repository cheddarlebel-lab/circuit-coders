import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const CC = '/Users/leolebel/clawd/circuit-coders';
const env = {};
for (const fn of ['.env', '.env.production', '.env.local']) {
  const fp = path.join(CC, fn);
  if (!fs.existsSync(fp)) continue;
  for (const l of fs.readFileSync(fp, 'utf8').split('\n')) {
    const m = l.replace(/^export\s+/, '').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) { const v = m[2].trim().replace(/^["']|["']$/g, ''); if (v) env[m[1]] = v; }
  }
}
const db = createClient({ url: env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, 'https://'), authToken: env.TURSO_AUTH_TOKEN });

const TOK = 'cctrktest01';
// arm a test token on one real dealer, reset to freshly-'sent'
const target = (await db.execute({ sql: "SELECT id,name FROM outreach_prospects WHERE product='lothours' AND email IS NOT NULL ORDER BY id LIMIT 1", args: [] })).rows[0];
await db.execute({ sql: "UPDATE outreach_prospects SET track_token=?, status='sent', clicks=0, first_click_at=NULL, last_click_at=NULL WHERE id=?", args: [TOK, target.id] });
console.log(`armed token on: ${target.name} (id ${target.id})`);

// readiness: is /proposal deployed?
const prop = await fetch(`https://www.circuitcoders.com/proposal/lothours?ref=${TOK}`);
console.log(`/proposal status: ${prop.status}`);
const html = await prop.text();
console.log(`  proposal shows dealer name (${target.name}): ${html.includes(target.name)}`);
console.log(`  proposal branded LotHours: ${html.includes('LotHours')}`);

// hit the tracked link (no auto-follow) — should 3xx to /proposal
const r = await fetch(`https://www.circuitcoders.com/r/${TOK}`, { redirect: 'manual' });
console.log(`/r/${TOK} status: ${r.status}  ->  ${r.headers.get('location')}`);

// confirm the click registered
const after = (await db.execute({ sql: "SELECT status,clicks,first_click_at FROM outreach_prospects WHERE id=?", args: [target.id] })).rows[0];
console.log(`AFTER CLICK -> status=${after.status}  clicks=${after.clicks}  first_click_at=${after.first_click_at}`);

// clean up: reset the test dealer back to pristine not_contacted
await db.execute({ sql: "UPDATE outreach_prospects SET track_token=NULL, status='not_contacted', clicks=0, first_click_at=NULL, last_click_at=NULL WHERE id=?", args: [target.id] });
console.log('reset test dealer to not_contacted');
