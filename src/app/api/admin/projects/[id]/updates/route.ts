import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { title, content, update_type } = await req.json();
  const db = getDb();

  db.prepare('INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)')
    .run(id, title, content, update_type || 'progress');

  db.prepare("UPDATE projects SET updated_at = datetime('now') WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
