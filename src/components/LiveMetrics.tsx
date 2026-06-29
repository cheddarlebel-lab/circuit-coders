"use client";

import { motion } from "framer-motion";
import { Activity, Rocket, Cpu, Globe, Zap, Users } from "lucide-react";

const metrics = [
  { icon: Zap, label: "Lighthouse Performance", value: "100", color: "text-circuit-400" },
  { icon: Globe, label: "Accessibility Score", value: "100", color: "text-blue-400" },
  { icon: Rocket, label: "SEO Score", value: "100", color: "text-amber-400" },
  { icon: Activity, label: "Hosting Uptime", value: "99.9%", color: "text-emerald-400" },
  { icon: Cpu, label: "Template Dependencies", value: "0", color: "text-purple-400" },
  { icon: Users, label: "Source Code You Own", value: "100%", color: "text-pink-400" },
];

function MetricCard({ metric, index }: { metric: typeof metrics[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative glass-card p-6 text-center hover-lift overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <metric.icon className={`w-5 h-5 ${metric.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
        <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums mb-1.5">
          {metric.value}
        </div>
        <div className="text-xs text-gray-200 uppercase tracking-wider font-semibold">
          {metric.label}
        </div>
      </div>
    </motion.div>
  );
}

export default function LiveMetrics() {
  return (
    <section id="metrics" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gray-200 tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit-500" />
            </span>
            OUR ENGINEERING STANDARDS
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
