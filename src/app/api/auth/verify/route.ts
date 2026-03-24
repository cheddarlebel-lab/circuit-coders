import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const email = req.nextUrl.searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/portal?error=invalid', req.url));
  }

  const db = await ensureDb();
  const customer = (await db.execute({
    sql: 'SELECT * FROM customers WHERE email = ? AND magic_token = ? AND token_expires_at > ?',
    args: [email, token, Date.now()]
  })).rows[0] as Record<string, unknown> | undefined;

  if (!customer) {
    return NextResponse.redirect(new URL('/portal?error=expired', req.url));
  }

  // Clear token
  await db.execute({ sql: 'UPDATE customers SET magic_token = NULL, token_expires_at = NULL WHERE id = ?', args: [customer.id as string] });

  const jwt = signToken({ role: 'customer', customerId: customer.id as number, email: customer.email as string }, '7d');
  const res = NextResponse.redirect(new URL('/portal/dashboard', req.url));
  res.cookies.set('cc_customer', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 86400,
    path: '/',
  });
  return res;
}
