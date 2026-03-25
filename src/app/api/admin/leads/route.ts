import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const search = req.nextUrl.searchParams.get('search') || '';
  const db = await ensureDb();

  let sql = `
    SELECT c.id, c.name, c.email, c.company, c.area_code, c.city, c.created_at,
      p.id as project_id, p.title as project_title, p.project_type, p.budget, p.timeline, p.status, p.description, p.created_at as inquiry_date
    FROM customers c
    JOIN projects p ON p.customer_id = c.id
    ORDER BY CASE p.status WHEN 'inquiry' THEN 0 WHEN 'quoted' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'review' THEN 3 WHEN 'completed' THEN 4 ELSE 5 END, p.created_at DESC
  `;

  let rows;
  if (search.trim()) {
    sql = `
      SELECT c.id, c.name, c.email, c.company, c.area_code, c.city, c.created_at,
        p.id as project_id, p.title as project_title, p.project_type, p.budget, p.timeline, p.status, p.description, p.created_at as inquiry_date
      FROM customers c
      JOIN projects p ON p.customer_id = c.id
      WHERE c.area_code LIKE ? OR c.city LIKE ? OR c.name LIKE ? OR c.company LIKE ?
      ORDER BY CASE p.status WHEN 'inquiry' THEN 0 WHEN 'quoted' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'review' THEN 3 WHEN 'completed' THEN 4 ELSE 5 END, p.created_at DESC
    `;
    const pattern = `%${search.trim()}%`;
    rows = (await db.execute({ sql, args: [pattern, pattern, pattern, pattern] })).rows;
  } else {
    rows = (await db.execute({ sql, args: [] })).rows;
  }

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customer_id, area_code, city } = await req.json();
  if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

  const db = await ensureDb();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  if (area_code !== undefined) { sets.push('area_code = ?'); args.push(area_code ?? null); }
  if (city !== undefined) { sets.push('city = ?'); args.push(city ?? null); }

  if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  args.push(customer_id);
  await db.execute({ sql: `UPDATE customers SET ${sets.join(', ')} WHERE id = ?`, args });

  return NextResponse.json({ success: true });
}
