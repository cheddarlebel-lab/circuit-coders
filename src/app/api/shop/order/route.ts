import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { randomUUID } from 'crypto';

const PACKS: Record<string, { quantity: number; price: number; label: string }> = {
  starter: { quantity: 12, price: 2900, label: 'Starter Pack — 12 Cards' },
  pro: { quantity: 24, price: 4900, label: 'Pro Pack — 24 Cards' },
  bulk: { quantity: 48, price: 8900, label: 'Bulk Pack — 48 Cards' },
};

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.json();
  const { name, company, email, website, tagline, qr_url, accent, pack } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const packInfo = PACKS[pack];
  if (!packInfo) {
    return NextResponse.json({ error: 'Invalid pack selection' }, { status: 400 });
  }

  if (accent && !['green', 'purple'].includes(accent)) {
    return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
  }

  const db = await ensureDb();
  const orderId = `CC-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Insert order into database
  await db.execute({
    sql: `INSERT INTO card_orders (order_id, name, company, email, website, tagline, qr_url, accent, pack, quantity, amount, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [orderId, name, company || '', email, website || '', tagline || '', qr_url || '', accent || 'green', pack, packInfo.quantity, packInfo.price],
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://circuitcoders.com';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `3D Printed Business Cards — ${packInfo.label}`,
          description: `Custom cards for ${name}${company ? ` at ${company}` : ''} | ${accent} accent`,
        },
        unit_amount: packInfo.price,
      },
      quantity: 1,
    }],
    metadata: {
      card_order_id: orderId,
    },
    success_url: `${baseUrl}/shop?payment=success`,
    cancel_url: `${baseUrl}/shop?payment=cancelled`,
  });

  // Store stripe session ID
  await db.execute({
    sql: 'UPDATE card_orders SET stripe_session_id = ? WHERE order_id = ?',
    args: [checkoutSession.id, orderId],
  });

  return NextResponse.json({ url: checkoutSession.url, order_id: orderId });
}
