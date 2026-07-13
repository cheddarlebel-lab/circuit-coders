import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

const CONTACTED = new Set(['sent', 'replied', 'meeting', 'won', 'lost', 'bounced']);

// GET — all outreach prospects (across products), ordered by pipeline stage.
export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await ensureDb();
  const rows = (await db.execute(`
    SELECT * FROM outreach_prospects
    ORDER BY CASE status
      WHEN 'won' THEN 0 WHEN 'meeting' THEN 1 WHEN 'replied' THEN 2
      WHEN 'sent' THEN 3 WHEN 'not_contacted' THEN 4 ELSE 5 END,
      product, name
  `)).rows;
  return NextResponse.json({ prospects: rows });
}

// POST — bulk seed (idempotent on product+name) or add one prospect.
export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await ensureDb();
  const body = await req.json();
  const list = Array.isArray(body.prospects) ? body.prospects : [body];

  let added = 0;
  for (const p of list) {
    if (!p?.name) continue;
    const product = p.product || 'circuit_coders';
    const dupe = (await db.execute({
      sql: `SELECT id FROM outreach_prospects WHERE product=? AND lower(name)=lower(?) LIMIT 1`,
      args: [product, p.name],
    })).rows;
    if (dupe.length) continue;
    await db.execute({
      sql: `INSERT INTO outreach_prospects
        (product,name,contact_name,city,region,email,phone,website,segment,status,channel,notes,last_touch_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        product, p.name, p.contact_name ?? null, p.city ?? null, p.region ?? null,
        p.email ?? null, p.phone ?? null, p.website ?? null, p.segment ?? null,
        p.status ?? 'not_contacted', p.channel ?? null, p.notes ?? null,
        p.last_touch_at ?? (CONTACTED.has(p.status) ? new Date().toISOString() : null),
      ],
    });
    added++;
  }
  return NextResponse.json({ added });
}

// PATCH — update a prospect's status / notes; stamps last_touch on any contacted status.
export async function PATCH(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, status, notes } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await ensureDb();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  if (status !== undefined) {
    sets.push('status = ?'); args.push(status);
    if (CONTACTED.has(status)) { sets.push("last_touch_at = datetime('now')"); }
  }
  if (notes !== undefined) { sets.push('notes = ?'); args.push(notes ?? null); }
  if (!sets.length) return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
  args.push(id);
  await db.execute({ sql: `UPDATE outreach_prospects SET ${sets.join(', ')} WHERE id = ?`, args });
  return NextResponse.json({ ok: true });
}
