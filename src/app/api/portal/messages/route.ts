import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession('customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, content } = await req.json();
  if (!content) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const db = getDb();

  // Verify project belongs to customer
  if (project_id) {
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND customer_id = ?')
      .get(project_id, session.customerId);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare('INSERT INTO messages (project_id, customer_id, sender, content) VALUES (?, ?, ?, ?)')
    .run(project_id, session.customerId, 'customer', content);

  return NextResponse.json({ success: true });
}
