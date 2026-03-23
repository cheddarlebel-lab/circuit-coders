import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const email = req.nextUrl.searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/portal?error=invalid', req.url));
  }

  const db = getDb();
  const customer = db.prepare(
    'SELECT * FROM customers WHERE email = ? AND magic_token = ? AND token_expires_at > ?'
  ).get(email, token, Date.now()) as Record<string, unknown> | undefined;

  if (!customer) {
    return NextResponse.redirect(new URL('/portal?error=expired', req.url));
  }

  // Clear token
  db.prepare('UPDATE customers SET magic_token = NULL, token_expires_at = NULL WHERE id = ?')
    .run(customer.id);

  const jwt = signToken({ role: 'customer', customerId: customer.id, email: customer.email }, '7d');
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
