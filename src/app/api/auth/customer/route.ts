import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateMagicToken, signToken } from '@/lib/auth';
import { Resend } from 'resend';

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM_EMAIL = process.env.FROM_EMAIL || 'admin@circuitcoders.com';

// POST: request magic link
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const db = getDb();
    const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email) as Record<string, unknown> | undefined;
    if (!customer) {
      return NextResponse.json({ error: 'No account found with that email. Contact us to get started.' }, { status: 404 });
    }

    const token = generateMagicToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min
    db.prepare('UPDATE customers SET magic_token = ?, token_expires_at = ? WHERE id = ?')
      .run(token, expiresAt, customer.id);

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://circuitcoders.com';
    const magicLink = `${baseUrl}/portal/verify?token=${token}&email=${encodeURIComponent(email)}`;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Circuit Coders Portal Login',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #00e68a;">Circuit Coders</h2>
          <p>Click below to access your project portal:</p>
          <a href="${magicLink}" style="display: inline-block; background: #00e68a; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Open Portal
          </a>
          <p style="color: #888; font-size: 13px; margin-top: 20px;">This link expires in 15 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
