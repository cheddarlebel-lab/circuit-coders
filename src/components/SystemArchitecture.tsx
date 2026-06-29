"use client";

import { motion } from "framer-motion";
import { Search, PhoneCall, Webhook, ArrowRight } from "lucide-react";

const stages = [
  {
    icon: Search,
    step: "01",
    title: "Traffic Ingestion",
    body: "Hyper-optimized local schema markup and a sub-second mobile landing page put you at the top of the Google map pack — ahead of national franchises.",
  },
  {
    icon: PhoneCall,
    step: "02",
    title: "Autonomous Conversion",
    body: "Your live AI voice agent answers every call 24/7, qualifies the job, and logs every missed call to a database — so nothing leaks. Hear it: (760) 546-9189.",
  },
  {
    icon: Webhook,
    step: "03",
    title: "Operation Sync",
    body: "Webhooks route each lead's name, number, and reason straight to your phone via SMS — or into your field-management CRM and Stripe invoicing.",
  },
];

export default function SystemArchitecture() {
  return (
    <section id="architecture" className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">Not a website.</span>{" "}
            <span className="text-gradient">An automated revenue utility.</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            Every build runs the same engineered pipeline — traffic in, calls
            captured, leads synced to your operation. No piece is optional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {stages.map((stage, i) => (
            <div key={stage.step} className="relative flex">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card rounded-2xl p-7 flex flex-col w-full"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-circuit-500/10 border border-circuit-500/25 flex items-center justify-center">
                    <stage.icon className="w-6 h-6 text-circuit-400" />
                  </div>
                  <span className="text-xs font-mono text-circuit-300/60 tracking-widest">{stage.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{stage.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{stage.body}</p>
              </motion.div>

              {/* connector arrow (desktop) */}
              {i < stages.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-circuit-400/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
