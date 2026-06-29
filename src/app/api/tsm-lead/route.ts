import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Anti-abuse token — Retell must call ...?token=TSM_WEBHOOK_TOKEN
const TOKEN = process.env.TSM_WEBHOOK_TOKEN || "tsm_lead_9f3a2c8b1e";
// Who gets the instant lead alert. Default = Leo (testing). Add Efrain at go-live.
const NOTIFY = (process.env.TSM_LEAD_NOTIFY || "cheddar.lebel@gmail.com")
  .split(",").map((s) => s.trim()).filter(Boolean);
const SHOP_ADDR = "TSM Collision, 42371 Avenida Alvarado, Temecula, CA 92590";

// "2026-06-26T14:00:00" -> "20260626T140000" (floating local time; Outlook treats as local)
function icsStamp(iso: string): string | null {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}${m[6] || "00"}`;
}

function buildIcs(startIso: string, name: string, vehicle: string, notes: string): string | null {
  const start = icsStamp(startIso);
  if (!start) return null;
  // +60 min
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + 60);
  const end = icsStamp(d.toISOString().slice(0, 19));
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const uid = `tsm-${start}-${Math.abs(hash(name + vehicle))}@circuitcoders.com`;
  const esc = (s: string) => (s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Circuit Coders//TSM Collision//EN",
    "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${dtstamp}`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${esc(`Estimate — ${name}${vehicle ? ` (${vehicle})` : ""}`)}`,
    `DESCRIPTION:${esc(notes)}`, `LOCATION:${esc(SHOP_ADDR)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("token") !== TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const event = body?.event;
    const call = body?.call || {};
    if (event && event !== "call_analyzed") {
      return NextResponse.json({ ok: true, skipped: event });
    }

    const d = call?.call_analysis?.custom_analysis_data || {};
    const summary = call?.call_analysis?.call_summary || "";
    const name = d.caller_name || "";
    const phone = d.callback_number || call?.from_number || "";
    const apptIso = d.appointment_iso || "";
    const isBooking = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(apptIso);

    if (!name && !d.callback_number) {
      return NextResponse.json({ ok: true, skipped: "no_lead_data" });
    }

    const row = (label: string, val: string) =>
      val ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:bold;">${label}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${val}</td></tr>` : "";

    const html = `
      <h2 style="margin:0 0 4px;">${isBooking ? "📅 Estimate booked" : "🔧 New TSM Collision lead"}</h2>
      <p style="color:#666;margin:0 0 14px;">${isBooking ? "Tessa booked an estimate — invite attached, add it to your Outlook." : "Captured by Tessa (AI receptionist). Call them back."}</p>
      <table style="border-collapse:collapse;width:100%;max-width:560px;">
        ${row("Name", name)}
        ${row("Call back", phone ? `<a href="tel:${phone}">${phone}</a>` : "")}
        ${row("Vehicle", d.vehicle)}
        ${row("Damage / reason", d.damage_description)}
        ${row("Insurance", d.insurance_status)}
        ${row("Requested time", d.preferred_appointment)}
        ${isBooking ? row("Booked for", apptIso.replace("T", " ")) : ""}
        ${row("Called from", call?.from_number)}
      </table>
      ${summary ? `<h3 style="margin:16px 0 4px;">Call summary</h3><p style="white-space:pre-wrap;background:#f6f8f6;padding:12px;border-radius:8px;">${summary}</p>` : ""}
      ${call?.recording_url ? `<p><a href="${call.recording_url}">▶ Listen to the call</a></p>` : ""}
    `;

    const notes = [d.damage_description, d.vehicle, d.insurance_status ? `Insurance: ${d.insurance_status}` : "", phone ? `Call back: ${phone}` : ""].filter(Boolean).join(" · ");
    const ics = isBooking ? buildIcs(apptIso, name, d.vehicle || "", notes) : null;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "TSM Collision <onboarding@resend.dev>",
      to: NOTIFY,
      subject: `${isBooking ? "📅 Estimate booked" : "🔧 New lead"} — ${name || phone || "TSM Collision"}`,
      html,
      attachments: ics ? [{ filename: "estimate.ics", content: Buffer.from(ics).toString("base64") }] : undefined,
    });

    return NextResponse.json({ ok: true, notified: NOTIFY.length, booked: isBooking });
  } catch (e: unknown) {
    console.error("tsm-lead webhook error:", e);
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "tsm-lead webhook" });
}
