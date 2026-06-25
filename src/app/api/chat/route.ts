import { NextResponse } from "next/server";
import { CC_SYSTEM_PROMPT, fallbackReply } from "@/lib/cc-knowledge";

export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

// Model is env-overridable. Default per Anthropic guidance is claude-opus-4-8;
// for a high-volume public widget, claude-haiku-4-5 is the cost-effective choice —
// set CC_CHAT_MODEL=claude-haiku-4-5 in Vercel to switch.
const MODEL = process.env.CC_CHAT_MODEL || "claude-opus-4-8";

function sanitize(messages: unknown): Msg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is Msg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

export async function POST(req: Request) {
  let lastUserText = "";
  try {
    const body = await req.json();
    const messages = sanitize(body?.messages);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return NextResponse.json({ error: "No message" }, { status: 400 });
    }
    lastUserText = lastUser.content;

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CC_CHAT_API_KEY;

    // No key configured → zero-cost keyword fallback (FAQ + lead capture still work).
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(lastUserText), mode: "fallback" });
    }

    // Full AI mode (requires an approved Anthropic API key in env).
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: CC_SYSTEM_PROMPT,
      messages,
    });
    const reply = resp.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ reply: reply || fallbackReply(lastUserText), mode: "ai" });
  } catch (err) {
    // Degrade gracefully to the keyword fallback rather than erroring the widget
    // (e.g. an invalid/expired key still gives the visitor a useful answer).
    console.error("chat route error:", err);
    if (lastUserText) {
      return NextResponse.json({ reply: fallbackReply(lastUserText), mode: "fallback" });
    }
    return NextResponse.json(
      { reply: "Sorry — I hit a snag. Please use the contact form and the team will reach out.", mode: "error" },
      { status: 200 },
    );
  }
}
