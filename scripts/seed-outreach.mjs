import { createClient } from '@libsql/client';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// creds — merge across env files (URL lives in .env.production, token in .env.local)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const fn of ['.env', '.env.production', '.env.local']) {
  const fp = path.join(root, fn);
  if (!fs.existsSync(fp)) continue;
  for (const line of fs.readFileSync(fp, 'utf8').split('\n')) {
    const m = line.replace(/^export\s+/, '').match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) { const v = m[2].trim().replace(/^["']|["']$/g, ''); if (v) env[m[1]] = v; }
  }
}
const db = createClient({
  url: env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, 'https://'),
  authToken: env.TURSO_AUTH_TOKEN,
});

await db.executeMultiple(`CREATE TABLE IF NOT EXISTS outreach_prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT NOT NULL DEFAULT 'circuit_coders',
  name TEXT NOT NULL, contact_name TEXT, city TEXT, region TEXT, email TEXT, phone TEXT,
  website TEXT, segment TEXT, status TEXT NOT NULL DEFAULT 'not_contacted', channel TEXT,
  notes TEXT, last_touch_at TEXT, created_at TEXT DEFAULT (datetime('now')));`);

const SENT = '2026-07-11T22:15:00Z';
const cc = [
  // sent 7/11 (cold email)
  { name: 'Inland Empire Autobody & Paint', city: 'Riverside', email: 'info@ieabp.com', phone: '(951) 465-7350', status: 'sent', channel: 'email', last_touch_at: SENT },
  { name: 'Royal Collision', city: 'Riverside', contact_name: 'Ryan', email: 'ryan@royalcollisionriverside.com', phone: '(951) 276-4421', status: 'sent', channel: 'email', last_touch_at: SENT },
  { name: 'Valley Wide Collision Specialist', city: 'Hemet', contact_name: 'Ivan', email: 'ivan@valleywidecollision.com', phone: '(951) 487-7092', status: 'sent', channel: 'email', last_touch_at: SENT },
  { name: 'Color Crafters Collision & Auto Body', city: 'Oceanside', email: 'Colorcraftersoceanside@gmail.com', phone: '(760) 439-1500', status: 'sent', channel: 'email', last_touch_at: SENT },
  { name: 'Alessandro Auto Body & Paint', city: 'Moreno Valley', email: 'AlessandroAuto@aol.com', phone: '(951) 697-0180', status: 'sent', channel: 'email', last_touch_at: SENT },
  { name: 'Menifee Collision Center', city: 'Menifee', email: 'menifeecollisioncenter@gmail.com', phone: '(951) 928-5545', status: 'sent', channel: 'email', last_touch_at: SENT },
  // warm board
  { name: 'Ikon Auto Collision', city: 'Murrieta', phone: '(626) 688-9668', status: 'sent', channel: 'email', notes: '2nd-touch sent 7/8, proposal hosted, exotic missed-call ROI. Awaiting reply.', last_touch_at: '2026-07-08T00:00:00Z' },
  { name: 'All Valley Collision', city: 'Murrieta', contact_name: 'Joe Salem', email: 'allvalleycollision@gmail.com', phone: '(951) 698-7877', status: 'lost', channel: 'email', notes: 'Soft NO ("No thanks" 7/8). Re-engaged, door open.', last_touch_at: '2026-07-08T00:00:00Z' },
  { name: 'TSM Collision', city: 'Temecula', contact_name: 'Efrain Vasquez', status: 'replied', channel: 'phone', notes: 'Re-close in progress on standalone AI receptionist $500 + $297/mo.', last_touch_at: '2026-07-08T00:00:00Z' },
  // next wave (not contacted) — mined, phones on file
  { name: 'Auto Body and Paint Solutions', city: 'Orange County', email: 'info@AutoBpSolutions.com', phone: '(714) 808-2017' },
  { name: 'Montclair Auto Body', city: 'Montclair', email: 'montclairautoinc@aol.com', phone: '(909) 988-5755' },
  { name: "Ruben's Auto Collision Center", city: 'Rancho Cucamonga', phone: '(909) 981-0487' },
  { name: 'Evolution Collision Inc.', city: 'Ontario', phone: '(909) 590-1166' },
  { name: 'European Automotive Collision Center', city: 'Corona', phone: '(951) 637-2886' },
  { name: 'Drive Auto Body', city: 'Riverside', phone: '(951) 268-3006' },
  { name: 'Tag Collision Center', city: 'Oceanside', phone: '(760) 510-4777' },
  { name: 'Picasso Auto Body', city: 'Riverside', phone: '(951) 509-9014' },
  { name: 'Los De Santiagos Auto Body', city: 'Riverside', phone: '(951) 246-8790' },
  { name: 'Collision Pros Auto Body and Paint', city: 'Lake Elsinore', phone: '(951) 245-8115' },
].map(p => ({ product: 'circuit_coders', region: 'SoCal', segment: 'Collision shop', status: 'not_contacted', ...p }));

// LotHours dealer groups — parse the expansion memory file
const lt = [];
const file = path.join(os.homedir(), 'memory/projects/lothours-expansion-2026-07.md');
let region = '';
for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
  const l = raw.replace(/\r$/, '');
  const h = l.match(/^##\s+(.*)/);
  if (h) { region = h[1].replace(/[—-].*/, '').replace(/CALIFORNIA|FLORIDA|TEXAS/i, m => m[0][0] + m.slice(1).toLowerCase()).trim(); continue; }
  const b = l.match(/^-\s+(?:🐋\s+)?\*\*(.+?)\*\*\s*(?:—|-)\s*(.*)$/);
  if (!b) continue;
  const name = b[1].trim();
  if (/excluded|do not/i.test(l)) continue;
  const rest = b[2];
  const ph = rest.match(/\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/);
  const notes = rest.replace(/\s+/g, ' ').trim().slice(0, 200);
  lt.push({ product: 'lothours', name, region, phone: ph ? ph[0] : null, segment: 'Dealer group', status: 'not_contacted', notes });
}

const all = [...cc, ...lt];
let added = 0, skipped = 0;
for (const p of all) {
  const dupe = await db.execute({ sql: `SELECT id FROM outreach_prospects WHERE product=? AND lower(name)=lower(?) LIMIT 1`, args: [p.product, p.name] });
  if (dupe.rows.length) { skipped++; continue; }
  await db.execute({
    sql: `INSERT INTO outreach_prospects (product,name,contact_name,city,region,email,phone,website,segment,status,channel,notes,last_touch_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [p.product, p.name, p.contact_name ?? null, p.city ?? null, p.region ?? null, p.email ?? null, p.phone ?? null, p.website ?? null, p.segment ?? null, p.status, p.channel ?? null, p.notes ?? null, p.last_touch_at ?? null],
  });
  added++;
}
const counts = await db.execute(`SELECT product, status, COUNT(*) n FROM outreach_prospects GROUP BY product, status ORDER BY product, status`);
console.log(`CC prospects: ${cc.length} | LotHours parsed: ${lt.length}`);
console.log(`added ${added}, skipped ${skipped} (dupes)`);
for (const r of counts.rows) console.log(`  ${r.product} · ${r.status}: ${r.n}`);
