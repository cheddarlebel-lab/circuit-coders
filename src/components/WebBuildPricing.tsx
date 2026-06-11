"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

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
    id: "starter",
    name: "Starter",
    price: "$499",
    priceSuffix: "flat",
    timeline: "48-hour turnaround",
    tagline: "For service businesses that need a clean, fast single-page site.",
    features: [
      "5-page static site",
      "Mobile-first responsive",
      "Basic on-page SEO",
      "Contact form → your inbox",
      "Custom domain setup",
      "1 revision round",
      "Live preview before payment",
    ],
    cta: "Start a Starter build",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$1,500",
    priceSuffix: "flat",
    timeline: "7-10 days",
    tagline: "The default for most small businesses — CMS, Stripe, custom CTAs.",
    features: [
      "10+ pages with CMS",
      "Custom design per brand",
      "Stripe checkout integrated",
      "Lead capture + admin inbox",
      "Local-SEO schema markup",
      "Photo gallery / portfolio",
      "3 revision rounds",
    ],
    cta: "Start a Pro build",
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$2,500",
    priceSuffix: "+",
    timeline: "10-14 days",
    tagline: "Full-stack: auth, database, admin dashboards, custom features.",
    features: [
      "Full Next.js 15 app",
      "Auth + user accounts",
      "Database + admin panel",
      "Payment flows + orders",
      "API integrations (any)",
      "Custom features quoted in scope",
      "Unlimited revision rounds during build",
    ],
    cta: "Start a Scale build",
  },
];

const retainer = {
  name: "Maintenance Retainer",
  price: "$199/mo",
  tagline: "Keep your site growing, not rotting.",
  features: [
    "Hosting + uptime monitoring",
    "Security patches + dependency updates",
    "2 hours/mo of content or layout edits",
    "Weekly backups",
    "Priority response within 24h",
  ],
};

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
            TRANSPARENT PRICING
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">Three tiers.</span>{" "}
            <span className="text-gradient">One price, flat.</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            No hourly billing. No surprises. You see a live preview before you
            pay a dollar. If the scope grows, we quote the upgrade in writing —
            never mid-build.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                  Most Common
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-2">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-2 mb-3">
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-8 rounded-2xl flex flex-col md:flex-row md:items-center gap-6"
        >
          <div className="flex-1">
            <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-2">
              Add-On
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white tracking-tight">
                {retainer.price}
              </span>
              <span className="text-sm text-gray-300">{retainer.name}</span>
            </div>
            <p className="text-gray-200 mb-4">{retainer.tagline}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            href="/#contact"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm glass-card text-white hover:border-circuit-500/40 transition-all duration-300 whitespace-nowrap"
          >
            Add to my build
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        <p className="text-center text-xs font-mono text-gray-300 tracking-wide mt-8">
          All tiers include: live preview before payment · custom domain setup ·
          mobile-first build · source code delivery
        </p>
      </div>
    </section>
  );
}
