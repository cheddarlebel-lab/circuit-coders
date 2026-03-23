import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const projects = db.prepare(`
    SELECT p.*, c.name as customer_name, c.email as customer_email, c.company,
      (SELECT COUNT(*) FROM messages m WHERE m.project_id = p.id AND m.read = 0 AND m.sender = 'customer') as unread_messages
    FROM projects p
    JOIN customers c ON c.id = p.customer_id
    ORDER BY p.updated_at DESC
  `).all();

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customer_id, title, description, project_type, status, budget, timeline } = await req.json();
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO projects (customer_id, title, description, project_type, status, budget, timeline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(customer_id, title, description, project_type || 'software', status || 'inquiry', budget, timeline);

  return NextResponse.json({ id: result.lastInsertRowid });
}
