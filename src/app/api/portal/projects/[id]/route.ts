import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = await ensureDb();

  const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ? AND customer_id = ?', args: [id, String(session.customerId)] })).rows[0];
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates = (await db.execute({ sql: 'SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at DESC', args: [id] })).rows;

  const messages = (await db.execute({ sql: 'SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC', args: [id] })).rows;

  // Mark admin messages as read
  await db.execute({ sql: "UPDATE messages SET read = 1 WHERE project_id = ? AND sender = 'admin' AND read = 0", args: [id] });

  return NextResponse.json({ project, updates, messages });
}
