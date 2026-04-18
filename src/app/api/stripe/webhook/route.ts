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
    const cardOrderId = session.metadata?.card_order_id;

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

    const printOrderId = session.metadata?.print_order_id;

    if (printOrderId) {
      const db = await ensureDb();
      await db.execute({
        sql: "UPDATE print_orders SET status = 'paid' WHERE order_id = ?",
        args: [printOrderId],
      });

      const order = (await db.execute({
        sql: 'SELECT * FROM print_orders WHERE order_id = ?',
        args: [printOrderId],
      })).rows[0];

      if (order) {
        const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0';
        const message = [
          `🖨️ *New Custom Print Order Paid!*`,
          ``,
          `*Order:* ${order.order_id}`,
          `*Name:* ${order.name}`,
          `*Email:* ${order.email}`,
          `*Size:* ${order.size}`,
          `*Material:* ${order.material}`,
          `*Colors:* ${order.colors || 'Single'}`,
          `*Amount:* $${amountPaid}`,
          `*File:* ${order.filename}`,
          `*Notes:* ${order.notes || 'None'}`,
          ``,
          `_Download file from admin dashboard._`,
        ].join('\n');

        try {
          await fetch(
            `https://api.telegram.org/bot8219388922:AAH3eGhbcCJPd_oSBHYPPROddcFWHnjVQXg/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: 7086525719,
                text: message,
                parse_mode: 'Markdown',
              }),
            }
          );
        } catch (err) {
          console.error('Failed to send Telegram notification:', err);
        }
      }
    }

    if (cardOrderId) {
      const db = await ensureDb();

      // Update card order status to paid
      await db.execute({
        sql: "UPDATE card_orders SET status = 'paid' WHERE order_id = ?",
        args: [cardOrderId],
      });

      // Fetch order details for notification
      const order = (await db.execute({
        sql: 'SELECT * FROM card_orders WHERE order_id = ?',
        args: [cardOrderId],
      })).rows[0];

      if (order) {
        const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0';
        const message = [
          `🎉 *New Card Order Paid!*`,
          ``,
          `*Order:* ${order.order_id}`,
          `*Name:* ${order.name}`,
          `*Company:* ${order.company || 'N/A'}`,
          `*Email:* ${order.email}`,
          `*Pack:* ${order.pack} (${order.quantity} cards)`,
          `*Amount:* $${amountPaid}`,
          `*Accent:* ${order.accent}`,
          `*Website:* ${order.website || 'N/A'}`,
          `*Tagline:* ${order.tagline || 'N/A'}`,
          `*QR URL:* ${order.qr_url || 'N/A'}`,
          ``,
          `Run card generator:`,
          `\`python3 generate_card.py --name "${order.name}" --company "${order.company || ''}" --email "${order.email}" --website "${order.website || ''}" --tagline "${order.tagline || ''}" --qr "${order.qr_url || ''}" --accent ${order.accent} --qty ${order.quantity}\``,
        ].join('\n');

        try {
          await fetch(
            `https://api.telegram.org/bot8219388922:AAH3eGhbcCJPd_oSBHYPPROddcFWHnjVQXg/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: 7086525719,
                text: message,
                parse_mode: 'Markdown',
              }),
            }
          );
        } catch (err) {
          console.error('Failed to send Telegram notification:', err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
