import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await ensureDb();
  const projects = (await db.execute({
    sql: `
    SELECT p.*, c.name as customer_name, c.email as customer_email, c.company,
      (SELECT COUNT(*) FROM messages m WHERE m.project_id = p.id AND m.read = 0 AND m.sender = 'customer') as unread_messages
    FROM projects p
    JOIN customers c ON c.id = p.customer_id
    ORDER BY p.updated_at DESC
  `, args: []
  })).rows;

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customer_id, title, description, project_type, status, budget, timeline } = await req.json();
  const db = await ensureDb();

  const result = await db.execute({
    sql: `
    INSERT INTO projects (customer_id, title, description, project_type, status, budget, timeline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, args: [customer_id, title, description ?? null, project_type || 'software', status || 'inquiry', budget ?? null, timeline ?? null]
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = await ensureDb();
  // Delete related data first
  await db.execute({ sql: 'DELETE FROM project_tasks WHERE project_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM messages WHERE project_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM project_updates WHERE project_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
