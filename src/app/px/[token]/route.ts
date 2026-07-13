import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

function gif() {
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Content-Length': String(PIXEL.length),
    },
  });
}

// GET /px/<token> — open-tracking pixel embedded in outreach emails.
// Logs the open (opens++, first/last_open_at). Always returns the gif so the
// email renders regardless. Soft signal: Gmail proxies & Apple MPP can inflate
// or suppress opens — clicks (/r) remain the hard signal.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    const db = await ensureDb();
    await db.execute({
      sql: `UPDATE outreach_prospects
            SET opens = opens + 1,
                first_open_at = COALESCE(first_open_at, datetime('now')),
                last_open_at = datetime('now')
            WHERE track_token = ?`,
      args: [token],
    });
  } catch { /* never break pixel rendering */ }
  return gif();
}
