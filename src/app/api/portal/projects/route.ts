import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const projects = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM project_updates pu WHERE pu.project_id = p.id) as update_count,
      (SELECT COUNT(*) FROM messages m WHERE m.project_id = p.id AND m.sender = 'admin' AND m.read = 0) as unread_replies
    FROM projects p
    WHERE p.customer_id = ?
    ORDER BY p.updated_at DESC
  `).all(session.customerId);

  return NextResponse.json(projects);
}
