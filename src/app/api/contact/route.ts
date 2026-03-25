import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ensureDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Contact form submission:", JSON.stringify({ name: body.name, email: body.email, projectType: body.projectType }));
    const { name, email, company, projectType, budget, timeline, description, components } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Save to database — create customer if new, then create project + initial message
    const db = await ensureDb();
    let customer: { id: number } | undefined;
    const existingRow = (await db.execute({ sql: 'SELECT id FROM customers WHERE email = ?', args: [email] })).rows[0];
    if (existingRow) customer = { id: Number(existingRow.id) };
    if (!customer) {
      const result = await db.execute({ sql: 'INSERT INTO customers (name, email, company) VALUES (?, ?, ?)', args: [name, email, company ?? null] });
      customer = { id: Number(result.lastInsertRowid) };
    }
    const projectResult = await db.execute({
      sql: 'INSERT INTO projects (customer_id, title, description, project_type, status, budget, timeline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [customer.id, `${projectType} project — ${name}`, description ?? null, projectType, 'inquiry', budget ?? null, timeline ?? null]
    });
    const projectId = Number(projectResult.lastInsertRowid);

    const componentList = components?.length ? components.join(", ") : "None selected";
    const msgContent = `New inquiry:\n${description}\n\nComponents: ${componentList}\nBudget: ${budget}\nTimeline: ${timeline || 'Not specified'}`;
    await db.execute({
      sql: 'INSERT INTO messages (project_id, customer_id, sender, content) VALUES (?, ?, ?, ?)',
      args: [projectId, customer.id, 'customer', msgContent]
    });

    const htmlContent = `
      <h2>New Project Inquiry from CircuitCoders.com</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;">${company || "N/A"}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Project Type</td><td style="padding:8px;border-bottom:1px solid #eee;">${projectType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Budget</td><td style="padding:8px;border-bottom:1px solid #eee;">${budget}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Timeline</td><td style="padding:8px;border-bottom:1px solid #eee;">${timeline || "Not specified"}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Components</td><td style="padding:8px;border-bottom:1px solid #eee;">${componentList}</td></tr>
      </table>
      <h3 style="margin-top:20px;">Project Description</h3>
      <p style="white-space:pre-wrap;background:#f9f9f9;padding:16px;border-radius:8px;">${description}</p>
    `;

    // Try to send notification email (non-blocking — inquiry is already saved to DB)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CircuitCoders <onboarding@resend.dev>",
        to: process.env.CONTACT_EMAIL || "admin@circuitcoders.com",
        replyTo: email,
        subject: `New Inquiry: ${projectType} project from ${name}`,
        html: htmlContent,
      });
    } catch (emailError) {
      console.error("Email notification failed (inquiry still saved):", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    );
  }
}
