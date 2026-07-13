import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const CC = '/Users/leolebel/clawd/circuit-coders';
const SCRATCH = '/private/tmp/claude-501/-Users-leolebel/36f70496-6ed1-4107-8847-f457bfa86857/scratchpad';

const env = {};
for (const fn of ['.env', '.env.production', '.env.local']) {
  const fp = path.join(CC, fn);
  if (!fs.existsSync(fp)) continue;
  for (const l of fs.readFileSync(fp, 'utf8').split('\n')) {
    const m = l.replace(/^export\s+/, '').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) { const v = m[2].trim().replace(/^["']|["']$/g, ''); if (v) env[m[1]] = v; }
  }
}
const db = createClient({
  url: env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, 'https://'),
  authToken: env.TURSO_AUTH_TOKEN,
});

const files = fs.readdirSync(SCRATCH).filter(f => /^dealers_.*\.json$/.test(f));
let dealers = [];
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(SCRATCH, f), 'utf8'));
  dealers.push(...arr);
}
console.log(`Loaded ${dealers.length} dealers from ${files.length} region files: ${files.join(', ')}`);

let added = 0, skipped = 0, withEmail = 0;
for (const d of dealers) {
  const dupe = (await db.execute({
    sql: 'SELECT id FROM outreach_prospects WHERE product=? AND lower(name)=lower(?) LIMIT 1',
    args: ['lothours', d.name],
  })).rows;
  if (dupe.length) { skipped++; continue; }
  const notesBits = [`BBB ${d.bbb_rating}`];
  if (d.complaints) notesBits.push(`${d.complaints} complaints`);
  const notes = notesBits.join(' · ');
  await db.execute({
    sql: `INSERT INTO outreach_prospects
      (product,name,contact_name,city,region,email,phone,website,segment,status,channel,notes,bbb_rating,bbb_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: ['lothours', d.name, null, d.city ?? null, d.state ?? null,
      d.contact_email ?? null, d.phone ?? null, d.website ?? null, 'Dealership',
      'not_contacted', null, notes, d.bbb_rating ?? null, d.bbb_url ?? null],
  });
  added++;
  if (d.contact_email) withEmail++;
}

const tot = (await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours'")).rows[0].n;
const em = (await db.execute("SELECT COUNT(*) n FROM outreach_prospects WHERE product='lothours' AND email IS NOT NULL AND email<>''")).rows[0].n;
console.log(`Added ${added} new (${withEmail} with email), skipped ${skipped} dupes.`);
console.log(`LotHours total now: ${tot} prospects, ${em} with emails.`);
