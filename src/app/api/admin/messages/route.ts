import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const messages = db.prepare(`
    SELECT m.*, c.name as customer_name, c.email as customer_email,
      p.title as project_title
    FROM messages m
    JOIN customers c ON c.id = m.customer_id
    LEFT JOIN projects p ON p.id = m.project_id
    ORDER BY m.created_at DESC
  `).all();

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, customer_id, content } = await req.json();
  const db = getDb();

  db.prepare('INSERT INTO messages (project_id, customer_id, sender, content) VALUES (?, ?, ?, ?)')
    .run(project_id, customer_id, 'admin', content);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json();
  const db = getDb();

  if (ids && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE messages SET read = 1 WHERE id IN (${placeholders})`).run(...ids);
  }

  return NextResponse.json({ success: true });
}
