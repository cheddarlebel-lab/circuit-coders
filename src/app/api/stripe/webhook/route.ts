import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { onStatusChanged } from '@/lib/automation';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const projectId = session.metadata?.project_id;

    if (projectId) {
      const db = await ensureDb();

      // Get current status
      const project = (await db.execute({ sql: 'SELECT status FROM projects WHERE id = ?', args: [projectId] })).rows[0];
      const oldStatus = project ? String(project.status) : 'quoted';

      // Move project to in_progress (triggers task generation + portal access)
      await db.execute({
        sql: "UPDATE projects SET status = 'in_progress', updated_at = datetime('now') WHERE id = ?",
        args: [projectId],
      });

      // Post payment received update
      const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0';
      await db.execute({
        sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
        args: [projectId, 'Payment Received', `Payment of $${amountPaid} received. Your project is now in production!`, 'milestone'],
      });

      // Trigger automation (task generation, portal access email, etc.)
      await onStatusChanged(db, Number(projectId), oldStatus, 'in_progress');
    }
  }

  return NextResponse.json({ received: true });
}
