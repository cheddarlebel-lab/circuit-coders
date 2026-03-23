import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const updates = await req.json();
  const db = getDb();

  const fields = Object.keys(updates).filter(k => ['title', 'description', 'status', 'project_type', 'budget', 'timeline'].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => updates[f]);

  db.prepare(`UPDATE projects SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM project_updates WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM messages WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
