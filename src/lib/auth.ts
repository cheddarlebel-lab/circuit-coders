import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const DEV_JWT_SECRET = 'circuit-coders-dev-secret-change-me';
const DEV_ADMIN_PASSWORD = 'circuitadmin2026';

// Fail closed in production: never sign/verify with a public default secret.
function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set — refusing to use the default secret in production.');
  }
  return DEV_JWT_SECRET;
}

function getAdminPasswordHash(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD is not set in production.');
    }
    return bcrypt.hashSync(DEV_ADMIN_PASSWORD, 10);
  }
  return bcrypt.hashSync(pw, 10);
}

export function signToken(payload: Record<string, unknown>, expiresIn = '7d'): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return bcrypt.compareSync(password, getAdminPasswordHash());
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
  // Cryptographically secure, URL-safe (~43 chars) — replaces predictable Math.random().
  return randomBytes(32).toString('base64url');
}
