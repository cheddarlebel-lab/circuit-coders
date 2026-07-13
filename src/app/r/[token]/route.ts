import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /r/<token> — a tracked proposal link embedded in outreach emails.
// Logs the click (bumps count, stamps first/last click, flips 'sent' -> 'clicked'),
// then 302s to the product proposal. Unknown token just lands on the homepage.
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const base = req.nextUrl.origin;
  try {
    const db = await ensureDb();
    const row = (await db.execute({
      sql: 'SELECT id, product FROM outreach_prospects WHERE track_token = ? LIMIT 1',
      args: [token],
    })).rows[0] as unknown as { id: number; product: string } | undefined;
    if (!row) return NextResponse.redirect(`${base}/`);

    await db.execute({
      sql: `UPDATE outreach_prospects
            SET clicks = clicks + 1,
                first_click_at = COALESCE(first_click_at, datetime('now')),
                last_click_at = datetime('now'),
                last_touch_at = datetime('now'),
                status = CASE WHEN status = 'sent' THEN 'clicked' ELSE status END
            WHERE id = ?`,
      args: [row.id],
    });
    return NextResponse.redirect(`${base}/proposal/${row.product}?ref=${encodeURIComponent(token)}`);
  } catch {
    return NextResponse.redirect(`${base}/`);
  }
}
