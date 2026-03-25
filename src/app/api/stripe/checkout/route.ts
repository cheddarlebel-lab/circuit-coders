import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

// POST: Create a Stripe checkout session for a project quote
export async function POST(req: NextRequest) {
  const session = await getSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const { project_id, amount, description } = await req.json();
  if (!project_id || !amount) return NextResponse.json({ error: 'project_id and amount required' }, { status: 400 });

  const db = await ensureDb();
  const project = (await db.execute({ sql: 'SELECT p.*, c.email, c.name as customer_name FROM projects p JOIN customers c ON c.id = p.customer_id WHERE p.id = ?', args: [project_id] })).rows[0];
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://circuitcoders.com';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: String(project.email),
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: String(project.title),
          description: description || `Project quote for ${project.customer_name}`,
        },
        unit_amount: Math.round(Number(amount) * 100), // Convert dollars to cents
      },
      quantity: 1,
    }],
    metadata: {
      project_id: String(project_id),
    },
    success_url: `${baseUrl}/portal/dashboard?payment=success`,
    cancel_url: `${baseUrl}/portal/dashboard?payment=cancelled`,
  });

  // Store checkout session ID on the project for reference
  await db.execute({
    sql: "UPDATE projects SET updated_at = datetime('now') WHERE id = ?",
    args: [project_id],
  });

  return NextResponse.json({ url: checkoutSession.url, session_id: checkoutSession.id });
}
