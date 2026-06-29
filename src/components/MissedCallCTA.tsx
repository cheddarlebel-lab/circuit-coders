"use client";

import { motion } from "framer-motion";
import { PhoneCall, PhoneOff, Clock, Languages, CalendarCheck, MessageSquare } from "lucide-react";

const proofPoints = [
  { icon: Clock, label: "Answers 24/7" },
  { icon: Languages, label: "English + Spanish" },
  { icon: CalendarCheck, label: "Books the job" },
  { icon: MessageSquare, label: "Texts you the lead" },
];

export default function MissedCallCTA() {
  return (
    <section id="ai-receptionist" className="relative py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-card rounded-3xl p-10 sm:p-14 overflow-hidden"
        >
          {/* glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-circuit-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-300 tracking-widest mb-6">
              <PhoneOff className="w-3.5 h-3.5" />
              THE LEAKING FUNNEL
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-[1.08]">
              Up to <span className="text-circuit-300">62% of calls</span> to local shops
              go unanswered.
              <br className="hidden sm:block" />
              That&apos;s your competitor&apos;s next job.
            </h2>

            <p className="text-gray-200 text-lg leading-relaxed max-w-2xl mb-8">
              When your crew is on the floor or out on a site, the phone rings out — and
              that caller just dials the next shop. Our bilingual AI voice agent answers
              every call, qualifies the job, books it, and texts you the lead. It&apos;s
              cheaper than a front-desk hire and never clocks out.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="tel:+17605469189"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-circuit-500 text-carbon-500 font-bold rounded-xl hover:bg-circuit-400 transition-all duration-300 shadow-[0_0_40px_rgba(0,230,138,0.25)]"
              >
                <PhoneCall className="w-5 h-5" />
                Call (760) 546-9189 — talk to it yourself
              </a>
              <a
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-medium hover:border-circuit-500/40 transition-all duration-300"
              >
                See receptionist pricing
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/[0.06]">
              {proofPoints.map((p) => (
                <div key={p.label} className="flex items-center gap-2.5">
                  <p.icon className="w-5 h-5 text-circuit-400 flex-shrink-0" />
                  <span className="text-sm text-gray-100">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
