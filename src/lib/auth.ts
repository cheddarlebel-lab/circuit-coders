import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'circuit-coders-dev-secret-change-me';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'circuitadmin2026', 10);

export function signToken(payload: Record<string, unknown>, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

export async function getSession(role: 'admin' | 'customer'): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies();
  const cookieName = role === 'admin' ? 'cc_admin' : 'cc_customer';
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== role) return null;
  return payload;
}

export function generateMagicToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
}
