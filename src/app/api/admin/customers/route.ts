import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const customers = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM projects p WHERE p.customer_id = c.id) as project_count,
      (SELECT COUNT(*) FROM messages m WHERE m.customer_id = c.id AND m.read = 0 AND m.sender = 'customer') as unread_messages
    FROM customers c
    ORDER BY c.created_at DESC
  `).all();

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, company } = await req.json();
  if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 });

  const db = getDb();
  try {
    const result = db.prepare('INSERT INTO customers (name, email, company) VALUES (?, ?, ?)')
      .run(name, email, company);
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Customer with that email already exists' }, { status: 409 });
  }
}
