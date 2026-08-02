import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Anti-abuse token — Retell must call ...?token=LANETAB_WEBHOOK_TOKEN
const TOKEN = process.env.LANETAB_WEBHOOK_TOKEN || "lanetab_lead_7c4e9a2f16";
// Who gets the instant lead alert from the LaneTab inbound line (951) 517-4156.
const NOTIFY = (process.env.LANETAB_LEAD_NOTIFY || "cheddar.lebel@gmail.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

// "2026-08-04T14:00:00" -> "20260804T140000" (floating local time; calendars treat as local)
function icsStamp(iso: string): string | null {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}${m[6] || "00"}`;
}

function buildIcs(startIso: string, venue: string, name: string, notes: string): string | null {
  const start = icsStamp(startIso);
  if (!start) return null;
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + 30); // demo call = 30 min
  const end = icsStamp(d.toISOString().slice(0, 19));
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const uid = `lanetab-${start}-${Math.abs(hash(venue + name))}@circuitcoders.com`;
  const esc = (s: string) => (s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Circuit Coders//LaneTab//EN",
    "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${dtstamp}`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${esc(`LaneTab demo — ${venue || name || "prospect"}`)}`,
    `DESCRIPTION:${esc(notes)}`, "LOCATION:Phone call",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }

const FOOD_LABEL: Record<string, string> = {
  full_kitchen: "Full kitchen", grill: "Grill", snack_bar: "Snack bar",
  bar_only: "Bar only", none: "No food service", unknown: "Unknown",
};

// Subject-line prefix per intent, so the inbox sorts itself.
function headline(intent: string, isBooking: boolean): string {
  if (isBooking) return "📅 LaneTab demo booked";
  switch (intent) {
    case "existing_venue_support": return "🛠 LaneTab venue needs help";
    case "guest": return "🎳 Guest called the LaneTab line";
    case "vendor_spam": return "🗑 Vendor/spam call";
    default: return "🎯 New LaneTab lead";
  }
}

export async function POST(req: Request) {
  try {
    const limited = await rateLimit(req, "lanetab-lead", 20, 600); // 20 / 10 min per IP
    if (limited) return limited;

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
    const venue = d.venue_name || "";
    const intent = d.intent || "";
    const quality = d.lead_quality || "";
    const apptIso = d.appointment_iso || "";
    const isBooking = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(apptIso);

    // Don't email on a call that captured nothing usable.
    if (!name && !venue && !d.callback_number) {
      return NextResponse.json({ ok: true, skipped: "no_lead_data" });
    }
    // Spam calls get logged by Retell but don't need to hit the inbox.
    if (intent === "vendor_spam" && !name && !venue) {
      return NextResponse.json({ ok: true, skipped: "vendor_spam" });
    }

    const row = (label: string, val: string) =>
      val ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:bold;">${label}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${val}</td></tr>` : "";

    // The printer answer decides fit — LaneTab prints via Star CloudPRNT only.
    const printer = d.printer_brand_model || "";
    const printerFlag = /star/i.test(printer)
      ? ` <span style="color:#1a7f37;">✓ Star — supported today</span>`
      : /epson/i.test(printer)
        ? ` <span style="color:#b35c00;">⚠ Epson — NOT implemented (Star CloudPRNT only)</span>`
        : "";

    const title = headline(intent, isBooking);
    const html = `
      <h2 style="margin:0 0 4px;">${title}</h2>
      <p style="color:#666;margin:0 0 14px;">From the LaneTab inbound line (951) 517-4156.${quality ? ` Lead quality: <b>${quality}</b>.` : ""}</p>
      <table style="border-collapse:collapse;width:100%;max-width:620px;">
        ${row("Name", name)}
        ${row("Call back", phone ? `<a href="tel:${phone}">${phone}</a>` : "")}
        ${row("Email", d.caller_email ? `<a href="mailto:${d.caller_email}">${d.caller_email}</a>` : "")}
        ${row("Venue", venue)}
        ${row("City / state", d.venue_city_state)}
        ${row("Lanes / service points", d.lane_count)}
        ${row("Food service", FOOD_LABEL[d.food_service] || d.food_service)}
        ${row("Current POS", d.current_pos)}
        ${row("Printer", printer ? `${printer}${printerFlag}` : "")}
        ${row("Decision maker", d.decision_maker === true ? "Yes" : d.decision_maker === false ? "No" : "")}
        ${row("Intent", intent)}
        ${isBooking ? row("Demo booked for", apptIso.replace("T", " ")) : ""}
        ${row("Called from", call?.from_number)}
      </table>
      ${summary ? `<h3 style="margin:16px 0 4px;">Call summary</h3><p style="white-space:pre-wrap;background:#f6f8f6;padding:12px;border-radius:8px;">${summary}</p>` : ""}
      ${call?.recording_url ? `<p><a href="${call.recording_url}">▶ Listen to the call</a></p>` : ""}
    `;

    const notes = [
      venue, d.venue_city_state, d.lane_count ? `${d.lane_count} lanes` : "",
      FOOD_LABEL[d.food_service] || d.food_service,
      printer ? `Printer: ${printer}` : "", d.current_pos ? `POS: ${d.current_pos}` : "",
      phone ? `Call back: ${phone}` : "",
    ].filter(Boolean).join(" · ");
    const ics = isBooking ? buildIcs(apptIso, venue, name, notes) : null;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "LaneTab <onboarding@resend.dev>",
      to: NOTIFY,
      subject: `${title} — ${venue || name || phone || "LaneTab line"}`,
      html,
      attachments: ics ? [{ filename: "lanetab-demo.ics", content: Buffer.from(ics).toString("base64") }] : undefined,
    });

    return NextResponse.json({ ok: true, notified: NOTIFY.length, booked: isBooking });
  } catch (e: unknown) {
    console.error("lanetab-lead webhook error:", e);
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "lanetab-lead webhook" });
}
