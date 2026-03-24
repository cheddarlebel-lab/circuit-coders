"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, GitCommit, Cpu, Globe, Zap, Clock } from "lucide-react";

const metrics = [
  { icon: GitCommit, label: "Commits This Year", target: 4800, suffix: "+", color: "text-circuit-400" },
  { icon: Cpu, label: "Hardware Units Shipped", target: 340, suffix: "+", color: "text-blue-400" },
  { icon: Globe, label: "API Requests Served", target: 2.4, suffix: "M", color: "text-purple-400", decimals: 1 },
  { icon: Clock, label: "Avg. Response Time", target: 12, suffix: "ms", color: "text-amber-400" },
  { icon: Activity, label: "Uptime (12mo)", target: 99.97, suffix: "%", color: "text-emerald-400", decimals: 2 },
  { icon: Zap, label: "Deploys This Month", target: 47, suffix: "", color: "text-pink-400" },
];

function MetricCard({ metric, index }: { metric: typeof metrics[0]; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = metric.target / steps;
    let current = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= metric.target) {
          setCount(metric.target);
          clearInterval(interval);
        } else {
          const d = metric.decimals || 0;
          setCount(d > 0 ? Number(current.toFixed(d)) : Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, index * 100);
    return () => clearTimeout(delay);
  }, [isInView, metric.target, metric.decimals, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative glass-card p-6 text-center hover-lift overflow-hidden"
    >
      {/* Background pulse */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <metric.icon className={`w-5 h-5 ${metric.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
        <div className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums mb-1">
          {count}{metric.suffix}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
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
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit-500" />
            </span>
            LIVE METRICS
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
