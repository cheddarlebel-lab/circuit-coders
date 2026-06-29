"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Lock, Eye } from "lucide-react";

interface Tier {
  id: string;
  name: string;
  price: string;
  priceSuffix: string;
  timeline: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    id: "local-authority",
    name: "Local Authority",
    price: "$3,500",
    priceSuffix: "– $4,500 flat",
    timeline: "2–3 weeks",
    tagline:
      "For premium auto body, high-end detailing, and specialty trades. Stop renting your site from a platform that throttles your rankings — we build a bulletproof local search engine that makes you the premium choice in your city.",
    features: [
      "Bespoke, zero-downtime Next.js architecture — sub-second loads",
      "Integrated before/after photo gallery",
      "Localized schema markup to outrank franchises",
      "Automated text-back lead flow",
      "Engineered for the Google map pack",
      "Live staging preview before you pay",
      "You own 100% of the source code",
    ],
    cta: "Build my local authority site",
    highlighted: true,
  },
  {
    id: "enterprise-contractor",
    name: "Enterprise Contractor",
    price: "$7,500",
    priceSuffix: "– $12,000+ flat",
    timeline: "4–8 weeks",
    tagline:
      "For custom home builders, general contractors, and multi-location fleets. A unified digital stack: a cinematic, portfolio-driven front end that closes high-end clients, backed by a custom internal portal for projects, estimates, and updates.",
    features: [
      "Full custom application architecture",
      "Cinematic, portfolio-driven front end",
      "Secure client upload portals (blueprints, insurance estimates)",
      "Automated multi-stage funnel routing",
      "CRM + Stripe invoicing integration",
      "Project / estimate / customer management portal",
      "You own 100% of the source code",
    ],
    cta: "Scope my contractor stack",
  },
];

const retainers = [
  {
    kicker: "Flagship Add-On",
    name: "AI Receptionist",
    price: "$299–499/mo",
    setup: "+ per-minute usage" as string | null,
    href: "tel:+17605469189",
    tagline:
      "Cheaper than a front-desk hire, working 24/7/365, completely bilingual. A voice agent answers every call, books and qualifies the job, and texts you the details — so you stop losing $5,000 jobs to voicemail. Hear it live: (760) 546-9189.",
    cta: "Call the live demo",
    features: [
      "Answers 24/7 — nights, weekends, while you work the floor",
      "Books appointments & qualifies callers",
      "Bilingual (English / Spanish)",
      "Texts you caller name, number + reason instantly",
      "Custom-trained on your business",
    ],
  },
  {
    kicker: "Recurring",
    name: "Local SEO + Google Maps",
    price: "$149/mo",
    setup: "$199 one-time setup" as string | null,
    href: "/#contact",
    tagline:
      "When someone searches “[your trade] near me”, the map pack shows before any website. This puts you in it — and keeps you there.",
    cta: "Get found on Maps",
    features: [
      "Google Business Profile claim, verify + full build-out",
      "Categories, services, photos + service areas done right",
      "Periodic Google posts that keep the listing active",
      "Review ask-flow — grow your stars after every job",
      "Monthly ranking + calls/views report",
    ],
  },
  {
    kicker: "Recurring",
    name: "Maintenance Retainer",
    price: "$199/mo",
    setup: null as string | null,
    href: "/#contact",
    tagline: "Keep your site fast and current — never rotting.",
    cta: "Add to my build",
    features: [
      "Zero-downtime static hosting + uptime monitoring",
      "Security patches + dependency updates",
      "2 hours/mo of content or layout edits",
      "Weekly backups",
      "Priority response within 24h",
    ],
  },
];

const guarantees = [
  { icon: Lock, title: "You own everything", body: "100% of your source code and data. No platform lock-in, ever." },
  { icon: Eye, title: "See it before you pay", body: "A full staging preview of your exact build before final payment." },
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
            Flat pricing, no hourly billing, no opaque platform lock-ins. You see
            a live staging preview before you pay a dollar, and you own 100% of
            the source code when we ship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
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
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-2">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                  <span className="text-5xl font-bold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-gray-300">
                    {tier.priceSuffix}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-300 tracking-wide">
                  {tier.timeline}
                </div>
              </div>

              <p className="text-gray-200 mb-6 leading-relaxed">
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

        {/* Risk reversal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
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

        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">Recurring assets that pay for themselves</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {retainers.map((retainer, i) => (
            <motion.div
              key={retainer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className={`glass-card p-8 rounded-2xl flex flex-col gap-6 ${
                i === 0 ? "border-circuit-400/50 shadow-[0_0_50px_rgba(0,230,138,0.10)]" : ""
              }`}
            >
              <div className="flex-1">
                <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-2">
                  {retainer.kicker}
                </div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {retainer.price}
                  </span>
                  <span className="text-sm text-gray-300">{retainer.name}</span>
                </div>
                {retainer.setup && (
                  <div className="text-xs font-mono text-gray-300 tracking-wide mb-3">
                    {retainer.setup}
                  </div>
                )}
                <p className="text-gray-200 mb-4 mt-2">{retainer.tagline}</p>
                <ul className="grid grid-cols-1 gap-2">
                  {retainer.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-100"
                    >
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-circuit-400/80" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={retainer.href}
                className={`group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  i === 0
                    ? "bg-circuit-500 text-carbon-500 hover:bg-circuit-400"
                    : "glass-card text-white hover:border-circuit-500/40"
                }`}
              >
                {retainer.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs font-mono text-gray-300 tracking-wide mt-8">
          Every engagement includes: milestone-based sign-offs · isolated staging-environment previews ·
          continuous deployment tracking · 100% source-code ownership
        </p>
      </div>
    </section>
  );
}
