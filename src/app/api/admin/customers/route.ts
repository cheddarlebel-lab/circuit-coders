import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await ensureDb();
  const customers = (await db.execute({
    sql: `
    SELECT c.*,
      (SELECT COUNT(*) FROM projects p WHERE p.customer_id = c.id) as project_count,
      (SELECT COUNT(*) FROM messages m WHERE m.customer_id = c.id AND m.read = 0 AND m.sender = 'customer') as unread_messages
    FROM customers c
    ORDER BY c.created_at DESC
  `, args: []
  })).rows;

  return NextResponse.json(customers);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = await ensureDb();
  // Get all projects for this customer to cascade deletes
  const projects = (await db.execute({ sql: 'SELECT id FROM projects WHERE customer_id = ?', args: [id] })).rows;
  for (const p of projects) {
    await db.execute({ sql: 'DELETE FROM project_updates WHERE project_id = ?', args: [p.id] });
  }
  await db.execute({ sql: 'DELETE FROM messages WHERE customer_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM projects WHERE customer_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM customers WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, company } = await req.json();
  if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 });

  const db = await ensureDb();
  try {
    const result = await db.execute({ sql: 'INSERT INTO customers (name, email, company) VALUES (?, ?, ?)', args: [name, email, company ?? null] });
    return NextResponse.json({ id: Number(result.lastInsertRowid) });
  } catch {
    return NextResponse.json({ error: 'Customer with that email already exists' }, { status: 409 });
  }
}
