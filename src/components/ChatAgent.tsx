"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Phone, Loader2, Check } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const DEMO_TEL = "+17605469189";
const DEMO_DISPLAY = "(760) 546-9189";
const GREETING =
  "Hey — I'm the Circuit Coders assistant. Ask me anything about websites, local SEO, AI receptionists, apps, or pricing. Or tell me what you're building and I'll point you the right way.";

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, showLead]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "assistant" || m.content !== GREETING) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Sorry, try again?" }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Connection hiccup — try the contact form and we'll reach out." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 18 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-2xl bg-circuit-500 text-carbon-500 flex items-center justify-center shadow-[0_8px_30px_rgba(0,230,138,0.35)] hover:shadow-[0_8px_40px_rgba(0,230,138,0.5)] transition-shadow"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" fill="currentColor" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-[60] w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))] flex flex-col rounded-2xl overflow-hidden bg-[#0a0a1e] border border-white/10 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-circuit-500/15 border border-circuit-500/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-circuit-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white leading-tight">Circuit Coders</div>
                  <div className="text-[11px] text-circuit-300/90 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-circuit-400 inline-block" /> Assistant · replies instantly
                  </div>
                </div>
              </div>
              <a
                href={`tel:${DEMO_TEL}`}
                className="flex items-center gap-1.5 text-[11px] font-mono text-circuit-300 hover:text-circuit-200 border border-circuit-500/25 rounded-lg px-2 py-1 transition-colors"
                title="Call the live AI receptionist demo"
              >
                <Phone className="w-3 h-3" /> Hear our AI
              </a>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-circuit-500 text-carbon-500 rounded-br-sm"
                        : "bg-white/[0.06] text-gray-100 border border-white/[0.08] rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                    <Loader2 className="w-4 h-4 text-circuit-300 animate-spin" />
                  </div>
                </div>
              )}
              {showLead && <LeadForm onDone={() => setShowLead(false)} />}
            </div>

            {/* Quick actions */}
            {!showLead && (
              <div className="px-3 pb-1 flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowLead(true)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-gray-200 hover:text-white hover:border-circuit-500/30 transition-colors"
                >
                  Leave my details
                </button>
                <a
                  href="/#pricing"
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-gray-200 hover:text-white hover:border-circuit-500/30 transition-colors"
                >
                  See pricing
                </a>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/[0.08] flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask about pricing, websites, AI receptionist…"
                className="flex-1 resize-none bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-circuit-500/40 max-h-24"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="w-9 h-9 flex-shrink-0 rounded-xl bg-circuit-500 text-carbon-500 flex items-center justify-center disabled:opacity-40 hover:bg-circuit-400 transition-colors"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LeadForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [need, setNeed] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit() {
    if (!name.trim() || !email.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          projectType: "Website chat lead",
          description: need || "(submitted via on-site chat assistant)",
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-circuit-500/30 bg-circuit-500/10 p-3 flex items-center gap-2 text-sm text-circuit-200">
        <Check className="w-4 h-4" /> Got it — the team will reach out soon.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 space-y-2">
      <div className="text-xs text-gray-300">Leave your details and the team will follow up:</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-circuit-500/40"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-circuit-500/40"
      />
      <input
        value={need}
        onChange={(e) => setNeed(e.target.value)}
        placeholder="What do you need? (optional)"
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-circuit-500/40"
      />
      {state === "error" && <div className="text-[11px] text-red-400">Something went wrong — try again.</div>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={state === "sending" || !name.trim() || !email.trim()}
          className="flex-1 bg-circuit-500 text-carbon-500 text-sm font-semibold rounded-lg py-1.5 disabled:opacity-40 hover:bg-circuit-400 transition-colors flex items-center justify-center gap-1.5"
        >
          {state === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
        </button>
        <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-200 px-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
