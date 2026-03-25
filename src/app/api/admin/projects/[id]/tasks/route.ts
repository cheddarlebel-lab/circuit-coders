import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = await ensureDb();
  const tasks = (await db.execute({
    sql: 'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY phase, sort_order, id',
    args: [id],
  })).rows;

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { phase, title, description } = await req.json();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const db = await ensureDb();
  const maxOrder = (await db.execute({
    sql: 'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM project_tasks WHERE project_id = ? AND phase = ?',
    args: [id, phase || 'development'],
  })).rows[0];

  const result = await db.execute({
    sql: 'INSERT INTO project_tasks (project_id, phase, title, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    args: [id, phase || 'development', title, description ?? null, Number(maxOrder.max_order) + 1],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { task_id, status, title, description } = await req.json();
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 });

  const db = await ensureDb();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  if (status !== undefined) {
    sets.push('status = ?');
    args.push(status);
    if (status === 'done') {
      sets.push("completed_at = datetime('now')");
    } else {
      sets.push('completed_at = NULL');
    }
  }
  if (title !== undefined) { sets.push('title = ?'); args.push(title); }
  if (description !== undefined) { sets.push('description = ?'); args.push(description ?? null); }

  if (sets.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

  args.push(task_id);
  await db.execute({ sql: `UPDATE project_tasks SET ${sets.join(', ')} WHERE id = ?`, args });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { task_id } = await req.json();
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 });

  const db = await ensureDb();
  await db.execute({ sql: 'DELETE FROM project_tasks WHERE id = ?', args: [task_id] });
  return NextResponse.json({ success: true });
}
