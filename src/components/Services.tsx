"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CircuitBoard, Code, Globe, Brain, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  CircuitBoard,
  Code,
  Globe,
  Brain,
};

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="relative py-32 px-4">
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-400 mb-6">
            WHAT WE BUILD
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-subtle">From Schematic to</span>{" "}
            <span className="text-gradient">Shipped Product</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Full-stack engineering that bridges the gap between digital code and
            physical hardware. No hand-offs — we own the entire stack.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="group relative glass-card-hover p-8 overflow-hidden card-spotlight hover-lift"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                {/* Hover glow */}
                <div className="absolute top-0 right-0 w-60 h-60 bg-circuit-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center group-hover:border-circuit-500/40 group-hover:bg-circuit-500/15 transition-all duration-500">
                      <Icon className="w-7 h-7 text-circuit-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-circuit-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-circuit-100 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-circuit-500/50 group-hover:bg-circuit-500 transition-colors" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
