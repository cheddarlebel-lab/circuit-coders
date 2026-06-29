import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { ensureDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_FILE = "/Users/leolebel/memory/logs/cc-inbound-leads.log";

function clean(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const shop_name = clean(body.shop_name ?? body.shop ?? body.company);
    const name = clean(body.name);
    const phone = clean(body.phone, 40);
    const email = clean(body.email, 200);
    const headache = clean(body.headache ?? body.description, 1000);
    const source = clean(body.source, 120) || "start-page";

    // Minimal validation — friction kills conversion, but we need a way to call back.
    if (!shop_name || !name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Shop name, your name, and phone are required." },
        { status: 400 }
      );
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: "INSERT INTO inbound_leads (shop_name, name, phone, email, headache, source) VALUES (?, ?, ?, ?, ?, ?)",
      args: [shop_name, name, phone, email || null, headache || null, source],
    });
    const id = Number(result.lastInsertRowid);

    // Best-effort notify chain — never let a notify failure break the lead insert.
    const at = new Date().toISOString();
    try {
      const line =
        JSON.stringify({ at, id, shop_name, name, phone, email, headache, source }) + "\n";
      await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
      await fs.appendFile(LOG_FILE, line, "utf8");
    } catch (logErr) {
      console.error("inbound-lead log append failed (lead still saved):", logErr);
    }
    try {
      const msg = `${name} · ${phone}${email ? " · " + email : ""}`;
      const subtitle = shop_name;
      execFile(
        "osascript",
        [
          "-e",
          `display notification ${JSON.stringify(msg)} with title "CC LEAD" subtitle ${JSON.stringify(subtitle)}`,
        ],
        () => {}
      );
    } catch (notifyErr) {
      console.error("inbound-lead osascript notify failed (lead still saved):", notifyErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("inbound-lead error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "inbound-lead" });
}
