import { type Client } from '@libsql/client/web';
import { getTaskTemplates } from './task-templates';

const RESEND_KEY = () => process.env.RESEND_API_KEY;
const FROM = () => process.env.FROM_EMAIL || 'CircuitCoders <onboarding@resend.dev>';
const BASE_URL = () => process.env.NEXT_PUBLIC_URL || 'https://circuitcoders.com';

// ─── Email helper ──────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const key = RESEND_KEY();
  if (!key) { console.error('RESEND_API_KEY not set, skipping email'); return; }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(key);
    await resend.emails.send({ from: FROM(), to, subject, html });
  } catch (e) { console.error('Email send failed:', e); }
}

function generateMagicToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Inquiry confirmation email to customer ────────────────────
export async function onInquiryCreated(db: Client, customerId: number, projectTitle: string, customerEmail: string, customerName: string) {
  await sendEmail(customerEmail, `We received your inquiry — ${projectTitle}`, `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
      <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
      </div>
      <h2 style="color:white;margin-top:0;">Hey ${customerName},</h2>
      <p>We got your inquiry for <strong style="color:#00e68a;">${projectTitle}</strong>. We'll review the details and get back to you within 24 hours with a quote or follow-up questions.</p>
      <p>You'll receive a link to your <strong>client portal</strong> once your project kicks off — where you can track progress, view updates, and message us directly.</p>
      <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:14px;color:#9ca3af;">What happens next:</p>
        <ol style="color:#d1d5db;font-size:14px;padding-left:20px;">
          <li>We review your requirements</li>
          <li>You receive a detailed quote</li>
          <li>Once approved, we start building</li>
          <li>You get real-time progress in your portal</li>
        </ol>
      </div>
      <p style="font-size:14px;color:#6b7280;">— The Circuit Coders Team</p>
    </div>
  `);
}

// ─── Project started — send portal access ──────────────────────
export async function onProjectStarted(db: Client, projectId: number) {
  const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [projectId] })).rows[0];
  if (!project) return;
  const customer = (await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [Number(project.customer_id)] })).rows[0];
  if (!customer) return;

  // Generate magic token for portal access
  const token = generateMagicToken();
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days for first access
  await db.execute({ sql: 'UPDATE customers SET magic_token = ?, token_expires_at = ? WHERE id = ?', args: [token, expires, customer.id] });

  const portalUrl = `${BASE_URL()}/portal/verify?token=${token}&email=${encodeURIComponent(String(customer.email))}`;

  await sendEmail(String(customer.email), `Your project is in production — ${project.title}`, `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
      <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
      </div>
      <h2 style="color:white;margin-top:0;">Great news, ${customer.name}!</h2>
      <p>Your project <strong style="color:#00e68a;">${project.title}</strong> is now in production. We've started working on it.</p>
      <p>You now have access to your <strong>client portal</strong> where you can:</p>
      <ul style="color:#d1d5db;">
        <li>Track real-time build progress</li>
        <li>View updates from our team</li>
        <li>Message us directly</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${portalUrl}" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;">Open Your Portal</a>
      </div>
      <p style="font-size:13px;color:#6b7280;">This link expires in 7 days. You can request a new one anytime at ${BASE_URL()}/portal</p>
      <p style="font-size:14px;color:#6b7280;">— The Circuit Coders Team</p>
    </div>
  `);

  // Auto-post first update
  await db.execute({
    sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
    args: [projectId, 'Project Kicked Off', 'Your project is now in production! We\'ve set up the task pipeline and started working. Check back here for progress updates.', 'milestone'],
  });
}

// ─── Auto-generate tasks for a project ─────────────────────────
export async function generateProjectTasks(db: Client, projectId: number, projectType: string) {
  // Check if tasks already exist
  const existing = (await db.execute({ sql: 'SELECT COUNT(*) as count FROM project_tasks WHERE project_id = ?', args: [projectId] })).rows[0];
  if (Number(existing.count) > 0) return; // Don't overwrite existing tasks

  const templates = getTaskTemplates(projectType);
  const phaseCounts: Record<string, number> = {};

  for (const t of templates) {
    const order = phaseCounts[t.phase] ?? 0;
    phaseCounts[t.phase] = order + 1;
    await db.execute({
      sql: 'INSERT INTO project_tasks (project_id, phase, title, description, sort_order) VALUES (?, ?, ?, ?, ?)',
      args: [projectId, t.phase, t.title, t.description ?? null, order],
    });
  }
}

// ─── On task toggled — check phase/project completion ──────────
export async function onTaskToggled(db: Client, projectId: number) {
  const tasks = (await db.execute({ sql: 'SELECT * FROM project_tasks WHERE project_id = ?', args: [projectId] })).rows;
  if (tasks.length === 0) return;

  const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [projectId] })).rows[0];
  if (!project) return;
  const customer = (await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [Number(project.customer_id)] })).rows[0];

  // Check each phase for completion
  const phases = ['planning', 'design', 'development', 'testing', 'deployment'];
  for (const phase of phases) {
    const phaseTasks = tasks.filter((t: Record<string, unknown>) => t.phase === phase);
    if (phaseTasks.length === 0) continue;

    const allDone = phaseTasks.every((t: Record<string, unknown>) => t.status === 'done');
    if (!allDone) continue;

    // Check if we already posted a completion update for this phase
    const existingUpdate = (await db.execute({
      sql: "SELECT id FROM project_updates WHERE project_id = ? AND title = ?",
      args: [projectId, `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Complete`],
    })).rows;
    if (existingUpdate.length > 0) continue;

    // Post phase completion update
    await db.execute({
      sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
      args: [
        projectId,
        `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Complete`,
        `All ${phase} tasks have been completed. ${phase === 'deployment' ? 'Your project is ready for review!' : 'Moving to the next phase.'}`,
        'milestone',
      ],
    });

    // Update project timestamp
    await db.execute({ sql: "UPDATE projects SET updated_at = datetime('now') WHERE id = ?", args: [projectId] });

    // Email customer on milestone
    if (customer) {
      await sendEmail(String(customer.email), `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase complete — ${project.title}`, `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
          <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
          </div>
          <h2 style="color:white;margin-top:0;">Milestone reached!</h2>
          <p>The <strong style="color:#00e68a;">${phase}</strong> phase of <strong>${project.title}</strong> is complete.</p>
          <p>${phase === 'deployment' ? 'Your project is ready for your review!' : 'We\'re moving on to the next phase.'}</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${BASE_URL()}/portal" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">View Progress</a>
          </div>
          <p style="font-size:14px;color:#6b7280;">— The Circuit Coders Team</p>
        </div>
      `);
    }
  }

  // Check if ALL tasks are done → auto-advance to review
  const allDone = tasks.every((t: Record<string, unknown>) => t.status === 'done');
  if (allDone && project.status === 'in_progress') {
    await db.execute({ sql: "UPDATE projects SET status = 'review', updated_at = datetime('now') WHERE id = ?", args: [projectId] });

    // Post update
    await db.execute({
      sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
      args: [projectId, 'Ready for Review', 'All production tasks are complete! Your project is ready for your review. Please check everything and let us know if you need any changes.', 'deliverable'],
    });

    // Email customer
    if (customer) {
      await sendEmail(String(customer.email), `Your project is ready for review — ${project.title}`, `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
          <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
          </div>
          <h2 style="color:#00e68a;margin-top:0;">Your project is ready!</h2>
          <p><strong>${project.title}</strong> has been completed and is ready for your review.</p>
          <p>Please log into your portal to review everything. If anything needs adjusting, just send us a message.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${BASE_URL()}/portal" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;">Review Your Project</a>
          </div>
          <p style="font-size:14px;color:#6b7280;">— The Circuit Coders Team</p>
        </div>
      `);
    }
  }
}

// ─── On quote sent — create Stripe checkout + email customer ───
export async function onQuoteSent(db: Client, projectId: number, amount?: number) {
  const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [projectId] })).rows[0];
  if (!project) return;
  const customer = (await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [Number(project.customer_id)] })).rows[0];
  if (!customer) return;

  const budget = amount || parseBudget(String(project.budget || ''));
  let paymentSection = '';

  // Try to create Stripe checkout if configured
  try {
    const { getStripe } = await import('./stripe');
    const stripe = getStripe();
    if (stripe && budget > 0) {
      const baseUrl = BASE_URL();
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: String(customer.email),
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: String(project.title),
              description: `Project quote for ${customer.name}`,
            },
            unit_amount: Math.round(budget * 100),
          },
          quantity: 1,
        }],
        metadata: { project_id: String(projectId) },
        success_url: `${baseUrl}/portal/dashboard?payment=success`,
        cancel_url: `${baseUrl}/portal/dashboard?payment=cancelled`,
      });

      if (session.url) {
        paymentSection = `
          <div style="text-align:center;margin:32px 0;">
            <a href="${session.url}" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;">Pay & Start Project — $${budget.toLocaleString()}</a>
          </div>
          <p style="font-size:13px;color:#6b7280;text-align:center;">Payment is processed securely through Stripe.</p>
        `;
      }
    }
  } catch (e) { console.error('Stripe checkout creation failed:', e); }

  // If no Stripe, just show the amount and a portal link
  if (!paymentSection) {
    paymentSection = `
      <div style="text-align:center;margin:32px 0;background:rgba(255,255,255,0.05);border-radius:8px;padding:24px;">
        <p style="font-size:28px;font-weight:bold;color:#00e68a;margin:0;">$${budget > 0 ? budget.toLocaleString() : 'See details'}</p>
        <p style="color:#9ca3af;font-size:14px;margin:8px 0 0 0;">Quoted amount</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BASE_URL()}/portal" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">View in Portal</a>
      </div>
    `;
  }

  await sendEmail(String(customer.email), `Your quote is ready — ${project.title}`, `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
      <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
      </div>
      <h2 style="color:white;margin-top:0;">Your quote is ready, ${customer.name}!</h2>
      <p>We've reviewed your inquiry for <strong style="color:#00e68a;">${project.title}</strong> and prepared a quote.</p>
      ${project.description ? `<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;"><p style="margin:0;font-size:14px;color:#d1d5db;">${String(project.description).substring(0, 300)}${String(project.description).length > 300 ? '...' : ''}</p></div>` : ''}
      ${paymentSection}
      <p style="font-size:14px;color:#6b7280;">Questions? Reply to this email or message us through your portal.<br/>— The Circuit Coders Team</p>
    </div>
  `);

  // Post update
  await db.execute({
    sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
    args: [projectId, 'Quote Sent', `We've sent you a quote${budget > 0 ? ` for $${budget.toLocaleString()}` : ''}. Check your email for details.`, 'milestone'],
  });
}

function parseBudget(budget: string): number {
  // Try to extract a number from budget strings like "$1,000-$5,000", "Under $500", "$50,000+"
  const matches = budget.replace(/,/g, '').match(/\d+/g);
  if (!matches) return 0;
  // If range, take the first number
  return Number(matches[0]) || 0;
}

// ─── Admin notification when customer sends message ────────────
export async function onCustomerMessage(db: Client, customerId: number, projectId: number | null, content: string) {
  const customer = (await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [customerId] })).rows[0];
  if (!customer) return;

  let projectTitle = 'General';
  if (projectId) {
    const project = (await db.execute({ sql: 'SELECT title FROM projects WHERE id = ?', args: [projectId] })).rows[0];
    if (project) projectTitle = String(project.title);
  }

  const adminEmail = process.env.CONTACT_EMAIL || 'admin@circuitcoders.com';
  await sendEmail(adminEmail, `New message from ${customer.name} — ${projectTitle}`, `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
      <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
      </div>
      <h2 style="color:white;margin-top:0;">New message from ${customer.name}</h2>
      <p style="color:#9ca3af;font-size:14px;">Project: <strong style="color:#d1d5db;">${projectTitle}</strong></p>
      <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#e5e7eb;white-space:pre-wrap;">${content}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BASE_URL()}/admin/dashboard" style="display:inline-block;background:#00e68a;color:#06061a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Open Dashboard</a>
      </div>
      <p style="font-size:13px;color:#6b7280;">Reply from the admin dashboard messages tab.</p>
    </div>
  `);
}

// ─── On status change — trigger appropriate automations ────────
export async function onStatusChanged(db: Client, projectId: number, oldStatus: string, newStatus: string) {
  if (newStatus === 'quoted' && oldStatus !== 'quoted') {
    await onQuoteSent(db, projectId);
  }

  if (newStatus === 'in_progress' && oldStatus !== 'in_progress') {
    const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [projectId] })).rows[0];
    if (!project) return;

    // Auto-generate tasks
    await generateProjectTasks(db, projectId, String(project.project_type));

    // Send portal access & kickoff email
    await onProjectStarted(db, projectId);
  }

  if (newStatus === 'completed' && oldStatus === 'review') {
    const project = (await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [projectId] })).rows[0];
    if (!project) return;
    const customer = (await db.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [Number(project.customer_id)] })).rows[0];

    // Post completion update
    await db.execute({
      sql: "INSERT INTO project_updates (project_id, title, content, update_type) VALUES (?, ?, ?, ?)",
      args: [projectId, 'Project Completed', 'Your project has been marked as complete. Thank you for choosing Circuit Coders! If you need any future work, we\'re here.', 'milestone'],
    });

    if (customer) {
      await sendEmail(String(customer.email), `Project complete — ${project.title}`, `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#06061a;color:#e5e7eb;padding:32px;border-radius:12px;">
          <div style="border-bottom:2px solid #00e68a;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="margin:0;font-size:24px;color:white;">Circuit<span style="color:#00e68a;">Coders</span></h1>
          </div>
          <h2 style="color:#00e68a;margin-top:0;">Project Complete!</h2>
          <p><strong>${project.title}</strong> is officially complete. Thank you for working with us!</p>
          <p>Your portal will remain accessible if you need to reference anything. If you need future work, don't hesitate to reach out.</p>
          <p style="font-size:14px;color:#6b7280;">— The Circuit Coders Team</p>
        </div>
      `);
    }
  }
}
