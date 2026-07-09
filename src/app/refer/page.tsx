"use client";

import { useState } from "react";
import {
  Gift,
  Send,
  CheckCircle,
  PhoneCall,
  Users,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import CircuitBackground from "@/components/CircuitBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PHONE_DISPLAY = "(760) 546-9189";
const PHONE_HREF = "tel:+17605469189";

const steps = [
  {
    icon: Users,
    title: "Send them our way",
    body: "Know a business owner losing calls to voicemail or stuck with a dead website? Introduce us — a name and number is enough.",
  },
  {
    icon: ShieldCheck,
    title: "We take great care of them",
    body: "Free audit, no pressure, no obligation. However it goes, they'll be glad you sent them. Your name stays gold.",
  },
  {
    icon: HandCoins,
    title: "You get $250",
    body: "If they sign on — website, Google, or the AI receptionist — you get $250, cash, once their first invoice clears. No cap on how many.",
  },
];

export default function ReferPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    business: "",
    contact: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.business) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/inbound-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_name: form.business,
          name: form.name,
          phone: form.phone,
          email: form.email,
          headache: `REFERRAL from ${form.name}. Referred contact: ${form.contact || "n/a"}. Notes: ${form.notes || "—"}`,
          source: "referral",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <CircuitBackground />
      <Navbar />
      <main className="relative">
        {/* Hero */}
        <section className="relative pt-36 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
              <Gift className="w-3.5 h-3.5" />
              CIRCUIT CODERS REFERRAL PROGRAM
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
              <span className="text-gradient-bright">$250</span>{" "}
              <span className="text-gradient">for every business you send us.</span>
            </h1>
            <p className="text-gray-200 text-lg leading-relaxed max-w-xl mx-auto">
              You know business owners. Some of them are bleeding jobs to missed calls or
              hiding behind a website that doesn&apos;t work. Send them our way — if they sign
              on, <span className="text-circuit-300 font-semibold">$250 is yours.</span> Cash.
              No limit.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="relative py-12 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-circuit-500/10 border border-circuit-500/30 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-circuit-300" />
                  </div>
                  <span className="font-mono text-xs text-gray-400 tracking-widest">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="relative py-10 px-4">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-center">
            <p className="text-gray-200 leading-relaxed">
              Not sure we&apos;re the real deal? Don&apos;t take our word for it —{" "}
              <a href={PHONE_HREF} className="text-circuit-300 font-semibold hover:underline">
                call {PHONE_DISPLAY}
              </a>{" "}
              and hear our AI receptionist answer a real call. That&apos;s the kind of thing
              your referral gets.
            </p>
          </div>
        </section>

        {/* Form */}
        <section id="refer-form" className="relative py-14 px-4">
          <div className="max-w-xl mx-auto">
            {status === "done" ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <CheckCircle className="w-12 h-12 text-circuit-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Got it — thank you.</h3>
                <p className="text-gray-300">
                  We&apos;ll reach out to {form.business} and take great care of them. The
                  second they sign, your $250 is on the way.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="glass-card rounded-2xl p-8 space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gradient-bright">Send us a referral</h2>
                  <p className="text-gray-400 text-sm mt-1">Takes 30 seconds. We handle the rest.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your name *" value={form.name} onChange={set("name")} placeholder="Your name" />
                  <Field label="Your phone *" value={form.phone} onChange={set("phone")} placeholder="So we can pay you" />
                </div>
                <Field label="Your email" value={form.email} onChange={set("email")} placeholder="Optional" />

                <div className="h-px bg-white/10 my-1" />

                <Field label="Business you're referring *" value={form.business} onChange={set("business")} placeholder="Their business name" />
                <Field label="Their name / phone" value={form.contact} onChange={set("contact")} placeholder="How we reach them (optional)" />
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">
                    Anything we should know?
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    placeholder="What do they need? Website, missed calls, Google…"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-circuit-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-2 bg-circuit-500 hover:bg-circuit-400 text-black font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : (<><Send className="w-4 h-4" /> Send referral</>)}
                </button>
                {status === "error" && (
                  <p className="text-red-400 text-sm text-center">
                    Something glitched — text it straight to {PHONE_DISPLAY} and we&apos;ll take it from there.
                  </p>
                )}
                <p className="text-gray-500 text-xs text-center">
                  $250 paid once their first invoice clears. No limit on referrals.
                </p>
              </form>
            )}

            <div className="text-center mt-8">
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-circuit-300 transition-colors"
              >
                <PhoneCall className="w-4 h-4" /> Rather just call? {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-circuit-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}
