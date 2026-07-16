"use client";

import { motion } from "framer-motion";
import { Globe, Zap, ShieldCheck, Sparkles, Scissors, Car, Droplets, HardHat, Waves, Wrench, ExternalLink } from "lucide-react";
import TiltCard from "./TiltCard";

type Demo = {
  id: string;
  number: string;
  industry: string;
  tagline: string;
  highlights: string[];
  accent: string;
  swatches: string[];
  icon: React.ElementType;
  navLabels: string[];
  heroLine1: string;
  heroLine2: string;
  ctaLabel: string;
  microLabel: string;
  fontStyle: "serif" | "sans" | "display";
  liveUrl?: string;
};

const demos: Demo[] = [
  {
    id: "barber",
    number: "01",
    industry: "Premium Barber Shop",
    tagline: "Editorial brass + bone aesthetic. Online booking, service menu, gallery.",
    highlights: ["Online booking", "Service menu", "Gallery", "Mobile-first"],
    accent: "#c9a961",
    swatches: ["#0e0d0a", "#c9a961", "#f4ede0"],
    icon: Scissors,
    navLabels: ["The Shop", "Services", "Team", "Visit"],
    heroLine1: "A modern",
    heroLine2: "classic cut.",
    ctaLabel: "Book a chair",
    microLabel: "CLASSIC CUTS · MAIN STREET",
    fontStyle: "serif",
    liveUrl: "https://lucky-ace.vercel.app",
  },
  {
    id: "auto-detail-premium",
    number: "02",
    industry: "High-End Auto Detailing",
    tagline: "Red-accent luxury build with package pricing and lead form.",
    highlights: ["Tier pricing", "Before/after", "Lead capture", "Local SEO"],
    accent: "#dc2626",
    swatches: ["#0a0a0a", "#dc2626", "#f5f5f5"],
    icon: Car,
    navLabels: ["Work", "Services", "About", "Book"],
    heroLine1: "Showroom",
    heroLine2: "every weekend.",
    ctaLabel: "Reserve a detail",
    microLabel: "PROFESSIONAL · INSURED · LOCAL",
    fontStyle: "display",
    liveUrl: "https://sr-elite.vercel.app",
  },
  {
    id: "mobile-detail",
    number: "03",
    industry: "Mobile Detailing Service",
    tagline: "Ice-blue clean with service-area map and 3-tier pricing.",
    highlights: ["Service-area map", "3-tier pricing", "Booking form", "Schema SEO"],
    accent: "#38bdf8",
    swatches: ["#0b1622", "#38bdf8", "#e0f2fe"],
    icon: Droplets,
    navLabels: ["Work", "Pricing", "Service Area", "Book"],
    heroLine1: "Mobile detail.",
    heroLine2: "We come to you.",
    ctaLabel: "Get a quote",
    microLabel: "FIVE-STAR RATED · 20-MILE RADIUS",
    fontStyle: "sans",
    liveUrl: "https://fresh1-mobile-detailing.vercel.app",
  },
  {
    id: "construction",
    number: "04",
    industry: "Custom Home Construction",
    tagline: "Editorial-grade hero photography for a general contractor. Consultation funnel.",
    highlights: ["Cinematic hero", "Project portfolio", "Consultation form", "Trust signals"],
    accent: "#b8924a",
    swatches: ["#0d0c0a", "#b8924a", "#ebe9e4"],
    icon: HardHat,
    navLabels: ["Work", "Services", "About", "Inquire"],
    heroLine1: "Dreams,",
    heroLine2: "one home at a time.",
    ctaLabel: "Schedule consultation",
    microLabel: "LICENSED · BONDED · INSURED",
    fontStyle: "serif",
  },
  {
    id: "carwash",
    number: "05",
    industry: "Local Car Wash",
    tagline: "Friendly, fast site for a neighborhood operator. Hours, location, pricing.",
    highlights: ["Hours + location", "Service menu", "Click-to-call", "Snappy load"],
    accent: "#0ea5e9",
    swatches: ["#0c1e2e", "#0ea5e9", "#f0f9ff"],
    icon: Waves,
    navLabels: ["Wash Menu", "Hours", "Location", "Call"],
    heroLine1: "Drive in dirty.",
    heroLine2: "Drive out clean.",
    ctaLabel: "View wash menu",
    microLabel: "OPEN 7 DAYS · WALK-IN WELCOME",
    fontStyle: "sans",
  },
  {
    id: "auto-custom",
    number: "06",
    industry: "Auto Customization Shop",
    tagline: "Bold, dark build for a custom wraps + audio shop. Portfolio-led.",
    highlights: ["Build gallery", "Service breakdown", "Quote request", "Instagram feed"],
    accent: "#a855f7",
    swatches: ["#0a0a14", "#a855f7", "#f5f3ff"],
    icon: Wrench,
    navLabels: ["Builds", "Services", "Quote", "Insta"],
    heroLine1: "Custom builds.",
    heroLine2: "No two alike.",
    ctaLabel: "Request a quote",
    microLabel: "WRAPS · AUDIO · LIGHTING · PERFORMANCE",
    fontStyle: "display",
    liveUrl: "https://inland-empire-autobody.vercel.app",
  },
];

const valueProps = [
  { icon: Zap, label: "Live in days", sub: "See a real demo before you pay" },
  { icon: ShieldCheck, label: "Fixed scope, from $1,500", sub: "Quoted up front. No surprises." },
  { icon: Sparkles, label: "Built from scratch", sub: "Not Wix. Not Squarespace." },
];

function fontFamily(style: Demo["fontStyle"]) {
  if (style === "serif") return "'Playfair Display', Georgia, serif";
  return "'Inter', system-ui, sans-serif";
}

export default function WebsiteDemos() {
  return (
    <section id="website-demos" className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-circuit-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
            <Globe className="w-3 h-3" />
            BUSINESS WEBSITE DEMOS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">Custom websites,</span>{" "}
            <span className="text-gradient">built for your trade.</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            Real builds across a few service-business categories — the ones marked
            <span className="text-circuit-300 font-semibold"> live</span> are deployed and
            clickable. Every one is from scratch — no templates, no themes — tuned to the
            trade it serves.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto"
        >
          {valueProps.map((prop) => (
            <div key={prop.label} className="glass-card p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-circuit-500/15 border border-circuit-500/30 flex items-center justify-center flex-shrink-0">
                <prop.icon className="w-5 h-5 text-circuit-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{prop.label}</div>
                <div className="text-xs text-gray-200 mt-0.5">{prop.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ perspective: 1200 }}>
          {demos.map((demo, i) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.6 }}
            >
            <TiltCard
              className="group relative overflow-hidden rounded-2xl bg-[#0a0a1e] border border-white/[0.07] hover:border-circuit-500/30 transition-colors duration-500 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_30px_60px_-20px_rgba(0,230,138,0.25)]"
              maxTilt={7}
            >
              <div className="h-1 w-full" style={{ backgroundColor: demo.accent }} />

              <div
                className="relative h-56 overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${demo.swatches[0]} 0%, ${demo.swatches[0]} 55%, ${demo.accent}1f 100%)`,
                }}
              >
                <div className="absolute top-2.5 left-3 right-3 flex items-center gap-1.5 opacity-90">
                  <div className="w-2 h-2 rounded-full bg-white/25" />
                  <div className="w-2 h-2 rounded-full bg-white/25" />
                  <div className="w-2 h-2 rounded-full bg-white/25" />
                  <div className="ml-2 flex-1 h-3.5 rounded-md bg-white/[0.08] border border-white/[0.06] flex items-center px-2">
                    <span className="text-[7px] font-mono text-white/50 truncate">
                      yourbusiness.com
                    </span>
                  </div>
                </div>

                <div className="absolute top-9 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <demo.icon className="w-3 h-3" style={{ color: demo.accent }} />
                    <span
                      className="text-[8px] font-bold tracking-wider"
                      style={{ color: demo.swatches[2] }}
                    >
                      BRAND
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    {demo.navLabels.map((label) => (
                      <span
                        key={label}
                        className="text-[7px] tracking-wide"
                        style={{ color: demo.swatches[2], opacity: 0.7 }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-x-5 top-[60px] bottom-12 flex flex-col justify-center">
                  <span
                    className="text-[7px] font-mono tracking-[0.18em] mb-2"
                    style={{ color: demo.accent }}
                  >
                    {demo.microLabel}
                  </span>
                  <div
                    className="leading-[0.95] tracking-tight font-bold"
                    style={{
                      color: demo.swatches[2],
                      fontFamily: fontFamily(demo.fontStyle),
                      fontStyle: demo.fontStyle === "serif" ? "italic" : "normal",
                      fontSize: "20px",
                    }}
                  >
                    {demo.heroLine1}
                    <br />
                    {demo.heroLine2}
                  </div>
                </div>

                <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
                  <div
                    className="px-2.5 py-1 rounded-md text-[8px] font-semibold"
                    style={{ backgroundColor: demo.accent, color: demo.swatches[0] }}
                  >
                    {demo.ctaLabel}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ color: demo.accent, fontSize: "8px" }}>
                        ★
                      </span>
                    ))}
                    <span
                      className="text-[7px] ml-1"
                      style={{ color: demo.swatches[2], opacity: 0.8 }}
                    >
                      5.0
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 px-4 py-2 rounded-lg bg-white/95 backdrop-blur text-carbon-500 text-xs font-semibold inline-flex items-center gap-1.5">
                    {demo.liveUrl ? <>View live site <ExternalLink className="w-3 h-3" /></> : "Sample design preview"}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <div className="text-[10px] font-mono text-circuit-300 tracking-widest mb-1.5 font-semibold">
                    {demo.liveUrl ? "● LIVE DEMO" : `SAMPLE ${demo.number}`}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {demo.industry}
                  </h3>
                </div>

                <p className="text-sm text-gray-200 mb-4 leading-relaxed">
                  {demo.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {demo.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-white/[0.06] text-gray-100 border border-white/[0.12]"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {demo.liveUrl && (
                  <a
                    href={demo.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-circuit-300 hover:text-circuit-200 transition-colors"
                  >
                    View live site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </TiltCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-14"
        >
          <p className="text-gray-200 text-base mb-5">
            Want a free demo of your own business website? No commitment, no upfront fee.
          </p>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-circuit-500 text-carbon-500 font-semibold rounded-xl hover:shadow-[0_0_40px_rgba(0,230,138,0.35)] transition-all duration-300"
          >
            Request a Free Demo
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
