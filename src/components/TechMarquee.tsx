"use client";

import { motion } from "framer-motion";

const benefits = [
  "Zero-downtime architecture",
  "Sub-second load times",
  "Localized schema markup",
  "Engineered for the map pack",
  "Autonomous lead capture",
  "Bilingual AI phone agent",
  "Conversion-optimized UX",
  "You own 100% of the code",
];

export default function TechMarquee() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-mono text-circuit-300/80 tracking-[0.25em] uppercase font-semibold">
            Engineered in by default
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.025 } },
          }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          {benefits.map((tech) => (
            <motion.span
              key={tech}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="px-4 py-2 glass-card text-sm font-mono text-gray-200 hover:text-circuit-300 hover:border-circuit-500/30 transition-colors duration-300 cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
