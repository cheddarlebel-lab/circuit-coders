import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { onCustomerMessage } from '@/lib/automation';

export async function POST(req: NextRequest) {
  const session = await getSession('customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, content } = await req.json();
  if (!content) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const db = await ensureDb();

  // Verify project belongs to customer
  if (project_id) {
    const project = (await db.execute({ sql: 'SELECT id FROM projects WHERE id = ? AND customer_id = ?', args: [project_id, session.customerId] })).rows[0];
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.execute({ sql: 'INSERT INTO messages (project_id, customer_id, sender, content) VALUES (?, ?, ?, ?)', args: [project_id, session.customerId, 'customer', content] });

  // Notify admin via email
  onCustomerMessage(db, Number(session.customerId), project_id ? Number(project_id) : null, content).catch(e => console.error('Admin notification error:', e));

  return NextResponse.json({ success: true });
}
