"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Lock, Eye } from "lucide-react";

interface Tier {
  id: string;
  name: string;
  badge: string;
  setup: string;
  monthly: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    id: "search-authority",
    name: "Search Authority",
    badge: "Single-location",
    setup: "$1,500",
    monthly: "$349",
    tagline:
      "For specialized sub-contractors and single-location shops that want to own local search and stop missing calls.",
    features: [
      "Bespoke single-location site, sub-second loads",
      "Localized schema → top of the Google map pack",
      "Automated text-back on every missed call",
      "Lead capture routed to your phone",
      "Monthly ranking + calls report",
      "You own 100% of the source code",
    ],
    cta: "Start with Search Authority",
  },
  {
    id: "full-operational-stack",
    name: "Full Operational Stack",
    badge: "Most chosen",
    setup: "$3,500",
    monthly: "$1,500",
    tagline:
      "The flagship. A complete revenue engine — search authority plus the integrated AI voice receptionist and cross-system pipeline routing.",
    features: [
      "Everything in Search Authority",
      "Integrated 24/7 bilingual AI voice receptionist",
      "Cross-system pipeline routing (calls → database → CRM/SMS)",
      "Before/after photo gallery + inbound estimator funnel",
      "Multi-stage lead-funnel automation",
      "Priority support + monthly strategy review",
    ],
    cta: "Build my operational stack",
    highlighted: true,
  },
  {
    id: "fleet-architecture",
    name: "Multi-Location / Fleet",
    badge: "Enterprise",
    setup: "$6,500",
    monthly: "$2,950",
    tagline:
      "For operators running multiple rooftops or a service fleet — deep database scaling, custom portals, and multi-tenant logic.",
    features: [
      "Everything in Full Operational Stack",
      "Multi-location / multi-tenant architecture",
      "Custom client portal (uploads, estimates, status)",
      "Database scaling + dedicated infrastructure",
      "CRM + Stripe invoicing integration",
      "Custom feature development to spec",
    ],
    cta: "Scope my fleet architecture",
  },
];

const guarantees = [
  { icon: Lock, title: "You own everything", body: "100% of your source code and data. No platform lock-in, ever." },
  { icon: Eye, title: "See it before you pay", body: "A full staging preview of your exact build before you go live." },
  { icon: ShieldCheck, title: "Zero-downtime hosting", body: "Static architecture so your phone, forms, and maps are never down." },
];

export default function WebBuildPricing() {
  return (
    <section id="pricing" className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
            BUILT FOR OPERATORS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">We build like engineers,</span>{" "}
            <span className="text-gradient">not agencies.</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            A one-time build, then a flat monthly that runs the engine. No hourly
            billing, no platform lock-in. You see a staging preview before you go
            live and you own 100% of the code.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative glass-card p-8 rounded-2xl flex flex-col ${
                tier.highlighted
                  ? "border-circuit-400/60 shadow-[0_0_60px_rgba(0,230,138,0.12)]"
                  : "border-white/8"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-circuit-500 text-carbon-500 text-[10px] font-bold tracking-widest uppercase rounded-full">
                  {tier.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-2">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {tier.setup}
                  </span>
                  <span className="text-sm text-gray-300">setup</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-circuit-300 tracking-tight">
                    + {tier.monthly}
                  </span>
                  <span className="text-sm text-gray-300">/ month</span>
                </div>
              </div>

              <p className="text-gray-200 mb-6 leading-relaxed text-sm">
                {tier.tagline}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-gray-100"
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? "text-circuit-300" : "text-circuit-400/80"
                      }`}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/#contact"
                className={`group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-circuit-500 text-carbon-500 hover:bg-circuit-400"
                    : "glass-card text-white hover:border-circuit-500/40"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Value realization anchor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-16 glass-card rounded-2xl p-7 border-circuit-400/30"
        >
          <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-3">
            Value realization
          </div>
          <p className="text-lg text-gray-100 leading-relaxed">
            Compared to a traditional{" "}
            <span className="text-white font-semibold">$3,500/mo front-desk operation</span>{" "}
            — or a single missed{" "}
            <span className="text-white font-semibold">$4,500 collision estimate</span> — this
            engine pays for itself the moment it captures your first multi-stage job of the month.
          </p>
        </motion.div>

        {/* Risk reversal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {guarantees.map((g) => (
            <div key={g.title} className="glass-card rounded-xl p-5 flex items-start gap-3">
              <g.icon className="w-5 h-5 text-circuit-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-white">{g.title}</div>
                <div className="text-xs text-gray-300 leading-relaxed mt-0.5">{g.body}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs font-mono text-gray-300 tracking-wide mt-10">
          Every engagement includes: milestone-based sign-offs · isolated staging-environment previews ·
          continuous deployment tracking · 100% source-code ownership
        </p>
      </div>
    </section>
  );
}
