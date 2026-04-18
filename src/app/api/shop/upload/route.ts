import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { randomUUID } from 'crypto';

const PRINT_PRICING: Record<string, { price: number; label: string }> = {
  small: { price: 1999, label: 'Small Print (up to 100x100mm)' },
  medium: { price: 3999, label: 'Medium Print (up to 200x200mm)' },
  large: { price: 6999, label: 'Large Print (up to 256x256mm — full plate)' },
};

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const email = formData.get('email') as string | null;
  const name = formData.get('name') as string | null;
  const size = formData.get('size') as string | null;
  const material = formData.get('material') as string | null;
  const notes = formData.get('notes') as string | null;
  const colors = formData.get('colors') as string | null;

  if (!file || !email || !name || !size) {
    return NextResponse.json({ error: 'File, name, email, and size are required' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['stl', '3mf', 'obj'].includes(ext)) {
    return NextResponse.json({ error: 'Only .stl, .3mf, and .obj files are accepted' }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 50MB' }, { status: 400 });
  }

  const pricing = PRINT_PRICING[size];
  if (!pricing) {
    return NextResponse.json({ error: 'Invalid size selection' }, { status: 400 });
  }

  const db = await ensureDb();
  const orderId = `CP-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Store file as base64 in DB (files are small enough for this)
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileBase64 = fileBuffer.toString('base64');

  await db.execute({
    sql: `INSERT INTO print_orders (order_id, name, email, size, material, colors, notes, filename, file_data, amount, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [orderId, name, email, size, material || 'PLA', colors || '', notes || '', file.name, fileBase64, pricing.price],
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://circuitcoders.com';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Custom 3D Print — ${pricing.label}`,
          description: `File: ${file.name} | Material: ${material || 'PLA'} | Colors: ${colors || 'Single'}`,
        },
        unit_amount: pricing.price,
      },
      quantity: 1,
    }],
    metadata: {
      print_order_id: orderId,
    },
    success_url: `${baseUrl}/shop?payment=success`,
    cancel_url: `${baseUrl}/shop?payment=cancelled`,
  });

  await db.execute({
    sql: 'UPDATE print_orders SET stripe_session_id = ? WHERE order_id = ?',
    args: [checkoutSession.id, orderId],
  });

  return NextResponse.json({ url: checkoutSession.url, order_id: orderId });
}
