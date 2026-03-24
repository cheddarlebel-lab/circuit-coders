import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await ensureDb();
  const campaigns = (await db.execute({
    sql: 'SELECT * FROM seo_campaigns ORDER BY updated_at DESC',
    args: [],
  })).rows;

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, client_name, website_url, target_keywords, status, monthly_budget, start_date, notes } = await req.json();
  if (!name) return NextResponse.json({ error: 'Campaign name required' }, { status: 400 });

  const db = await ensureDb();
  const result = await db.execute({
    sql: `INSERT INTO seo_campaigns (name, client_name, website_url, target_keywords, status, monthly_budget, start_date, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [name, client_name ?? null, website_url ?? null, target_keywords ?? null, status || 'planning', monthly_budget ?? null, start_date ?? null, notes ?? null],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const allowed = ['name', 'client_name', 'website_url', 'target_keywords', 'status', 'monthly_budget', 'start_date', 'notes', 'da_score', 'organic_traffic', 'keywords_ranked', 'backlinks'];
  const fields = Object.keys(updates).filter(k => allowed.includes(k));
  if (fields.length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => updates[f] ?? null);

  const db = await ensureDb();
  await db.execute({ sql: `UPDATE seo_campaigns SET ${sets}, updated_at = datetime('now') WHERE id = ?`, args: [...values, id] });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = await ensureDb();
  await db.execute({ sql: 'DELETE FROM seo_campaigns WHERE id = ?', args: [id] });

  return NextResponse.json({ success: true });
}
