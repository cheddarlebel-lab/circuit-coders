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
