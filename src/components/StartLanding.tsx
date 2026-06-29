"use client";

import { useEffect, useState } from "react";
import {
  PhoneCall,
  Send,
  CheckCircle,
  MapPin,
  Search,
  Bot,
  Globe2,
  BadgeCheck,
  ArrowDown,
  Clock,
  Languages,
} from "lucide-react";
import VoicemailCalculator from "./VoicemailCalculator";

const PHONE_DISPLAY = "(760) 546-9189";
const PHONE_HREF = "tel:+17605469189";

const theFix = [
  { icon: Globe2, label: "A fast website that actually ranks" },
  { icon: Search, label: "A Google Business Profile people can find" },
  { icon: Bot, label: "An AI receptionist that answers every call" },
];

function LeadForm() {
  const [form, setForm] = useState({
    shop_name: "",
    name: "",
    phone: "",
    email: "",
    headache: "",
  });
  const [source, setSource] = useState("start-page");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Tag which ad / campaign drove the lead (?src= or ?utm_source=).
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const src = p.get("src") || p.get("utm_source");
      const campaign = p.get("utm_campaign");
      if (src) setSource(campaign ? `${src}:${campaign}` : src);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const missing: string[] = [];
    if (!form.shop_name.trim()) missing.push("Shop name");
    if (!form.name.trim()) missing.push("Your name");
    if (!form.phone.trim()) missing.push("Phone");
    if (missing.length) {
      setError(`Please add: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inbound-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error ${res.status}: ${txt}`);
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Something went wrong: ${msg}. Or just call ${PHONE_DISPLAY}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all";
  const labelCls =
    "block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold";

  if (submitted) {
    return (
      <div className="glass-card p-10 text-center glow-border">
        <CheckCircle className="w-16 h-16 text-circuit-400 mx-auto mb-5" />
        <h3 className="text-2xl font-bold text-white mb-3">Got it — we&apos;re on it.</h3>
        <p className="text-gray-200 mb-6 leading-relaxed">
          We&apos;ll run your free website + Google audit and call you back with the
          findings. Want to hear the AI receptionist right now?
        </p>
        <a
          href={PHONE_HREF}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-circuit-500 text-carbon-500 font-bold rounded-xl hover:bg-circuit-400 transition-all duration-300"
        >
          <PhoneCall className="w-5 h-5" />
          Call {PHONE_DISPLAY}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-7 sm:p-8 space-y-5 glow-border">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Get your free shop audit</h3>
        <p className="text-sm text-gray-300">
          Website + Google check, plus a 60-second AI receptionist demo for your shop.
        </p>
      </div>

      <div>
        <label className={labelCls}>Shop name *</label>
        <input
          type="text"
          required
          value={form.shop_name}
          onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
          className={field}
          placeholder="e.g. Mike's Auto Body"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Your name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={field}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelCls}>Phone *</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={field}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Email{" "}
          <span className="text-gray-300 font-normal normal-case tracking-normal">
            (optional)
          </span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={field}
          placeholder="you@yourshop.com"
        />
      </div>

      <div>
        <label className={labelCls}>
          Biggest headache right now{" "}
          <span className="text-gray-300 font-normal normal-case tracking-normal">
            (optional)
          </span>
        </label>
        <textarea
          rows={2}
          value={form.headache}
          onChange={(e) => setForm({ ...form, headache: e.target.value })}
          className={`${field} resize-none`}
          placeholder="Missing calls? Invisible on Google? Slow site?"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group w-full py-4 bg-circuit-500 text-carbon-500 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-circuit-400"
      >
        {submitting ? (
          <>
            <span className="w-5 h-5 border-2 border-carbon-500/30 border-t-carbon-500 rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Get my free audit
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-400">
        No cost, no obligation. We&apos;ll call you back fast.
      </p>
    </form>
  );
}

export default function StartLanding() {
  return (
    <>
      {/* HERO */}
      <section className="relative px-4 pt-28 pb-20 sm:pt-32 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial-glow opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — pitch */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit-500" />
                </span>
                FOR AUTO · COLLISION · DETAIL SHOPS
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.04] tracking-tight mb-6">
                <span className="text-gradient-bright">You&apos;re losing </span>
                <span className="text-circuit-300">$3,000&ndash;$5,000</span>
                <span className="text-gradient-bright"> in jobs every month</span>
                <span className="text-gray-200 block mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold">
                  to missed calls and a Google listing nobody can find.
                </span>
              </h1>

              <p className="text-lg text-gray-200 max-w-lg mb-8 leading-relaxed">
                When the phone rings out, that caller dials the next shop. When you&apos;re
                invisible on Google, they never call at all. We build the fix.
              </p>

              <div className="space-y-3 mb-9">
                {theFix.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-circuit-500/10 border border-circuit-500/30 flex items-center justify-center">
                      <f.icon className="w-4 h-4 text-circuit-400" />
                    </span>
                    <span className="text-gray-100">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Secondary CTA — the live demo is the proof */}
              <div className="glass-card rounded-2xl p-5 sm:p-6 glow-border">
                <div className="flex items-center gap-2 text-xs font-mono text-circuit-300 tracking-widest mb-3">
                  <Bot className="w-3.5 h-3.5" />
                  HEAR IT YOURSELF — LIVE AI RECEPTIONIST
                </div>
                <a
                  href={PHONE_HREF}
                  className="group inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-circuit-500 text-carbon-500 font-bold rounded-xl hover:bg-circuit-400 transition-all duration-300 shadow-[0_0_40px_rgba(0,230,138,0.2)]"
                >
                  <PhoneCall className="w-5 h-5" />
                  Call {PHONE_DISPLAY} — talk to it now
                </a>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  This is the same AI front desk we run for a real collision shop. It picks
                  up, answers, and books — 24/7.
                </p>
              </div>
            </div>

            {/* Right — lead form (PRIMARY CTA) */}
            <div id="start-form" className="lg:sticky lg:top-24 scroll-mt-24">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ROI — reuse the missed-call calculator so they self-quantify the leak */}
      <VoicemailCalculator />

      {/* PROOF — real, non-fabricated */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-5">
              <BadgeCheck className="w-3.5 h-3.5" />
              REAL SHOPS, REAL SYSTEMS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-gradient-bright">Built for the trade.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-2 text-circuit-300 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-mono tracking-widest uppercase">
                  Temecula, CA
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">TSM Collision</h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                We built and run their live AI front desk — a bilingual receptionist that
                answers every call, qualifies the job, and books the estimate. That&apos;s
                the same system on the phone line above.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-2 text-circuit-300 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-mono tracking-widest uppercase">
                  Vero Beach, FL
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Toyota / Kia of Vero Beach</h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                We work with this Florida dealer group on their web and local presence —
                the same playbook, scaled to a multi-rooftop operation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
            {[
              { icon: Clock, label: "Answers 24/7" },
              { icon: Languages, label: "English + Spanish" },
              { icon: BadgeCheck, label: "You own everything we build" },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-sm text-gray-200">
                <p.icon className="w-4 h-4 text-circuit-400" />
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER + FINAL CTA */}
      <section className="relative py-24 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />
        <div className="max-w-3xl mx-auto">
          <div className="relative glass-card rounded-3xl p-9 sm:p-12 text-center overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-circuit-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
                <span className="text-gradient-bright">Free shop audit + a 60-second</span>{" "}
                <span className="text-gradient">AI receptionist demo</span>
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed mb-9 max-w-xl mx-auto">
                We&apos;ll check your website and Google presence, then build a quick AI
                receptionist demo for your shop. No cost, no obligation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#start-form"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-circuit-500 text-carbon-500 font-bold rounded-xl hover:bg-circuit-400 transition-all duration-300"
                >
                  <ArrowDown className="w-5 h-5" />
                  Get my free audit
                </a>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-medium hover:border-circuit-500/40 transition-all duration-300"
                >
                  <PhoneCall className="w-5 h-5 text-circuit-400" />
                  Or call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
