import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

// Durable, atomic fixed-window rate limiter backed by Turso (survives serverless cold starts,
// unlike an in-memory map). One SQL upsert per check. Accepts any Request (NextRequest extends it).

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns null if the request is allowed, or a 429 NextResponse if the limit is exceeded.
 * @param name    logical bucket name (e.g. "admin-login")
 * @param limit   max requests allowed per window
 * @param windowSec  window length in seconds
 */
export async function rateLimit(
  req: Request,
  name: string,
  limit: number,
  windowSec: number,
): Promise<NextResponse | null> {
  try {
    const db = await ensureDb();
    const bucket = `${name}:${clientIp(req)}`;
    const now = Math.floor(Date.now() / 1000);
    const res = await db.execute({
      sql: `INSERT INTO rate_limits (bucket, count, window_start)
            VALUES (?, 1, ?)
            ON CONFLICT(bucket) DO UPDATE SET
              count = CASE WHEN (? - window_start) > ? THEN 1 ELSE count + 1 END,
              window_start = CASE WHEN (? - window_start) > ? THEN ? ELSE window_start END
            RETURNING count`,
      args: [bucket, now, now, windowSec, now, windowSec, now],
    });
    const count = Number(res.rows[0]?.count ?? 1);
    if (count > limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(windowSec) } },
      );
    }
    return null;
  } catch {
    // Fail open on limiter errors — never take down a legit request because the counter hiccuped.
    return null;
  }
}
