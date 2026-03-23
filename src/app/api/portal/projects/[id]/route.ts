import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND customer_id = ?')
    .get(id, session.customerId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates = db.prepare('SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at DESC')
    .all(id);

  const messages = db.prepare('SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC')
    .all(id);

  // Mark admin messages as read
  db.prepare("UPDATE messages SET read = 1 WHERE project_id = ? AND sender = 'admin' AND read = 0")
    .run(id);

  return NextResponse.json({ project, updates, messages });
}
