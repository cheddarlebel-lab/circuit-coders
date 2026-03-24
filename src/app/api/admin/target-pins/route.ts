import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await ensureDb();
  const pins = (await db.execute({ sql: 'SELECT * FROM target_pins ORDER BY created_at DESC', args: [] })).rows;
  return NextResponse.json(pins);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { label, lat, lng, pin_type, notes } = await req.json();
  if (!label || lat == null || lng == null) return NextResponse.json({ error: 'label, lat, lng required' }, { status: 400 });

  const db = await ensureDb();
  const result = await db.execute({
    sql: 'INSERT INTO target_pins (label, lat, lng, pin_type, notes) VALUES (?, ?, ?, ?, ?)',
    args: [label, lat, lng, pin_type || 'target', notes ?? null],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = await ensureDb();
  await db.execute({ sql: 'DELETE FROM target_pins WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
