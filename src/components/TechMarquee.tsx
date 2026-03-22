"use client";

import { motion } from "framer-motion";
import { techStack } from "@/lib/data";

export default function TechMarquee() {
  const doubled = [...techStack, ...techStack];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-gray-600 tracking-widest uppercase">
            Technologies we ship with
          </p>
        </div>

        {/* First row — left to right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-carbon-500 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-carbon-500 to-transparent z-10" />

          <div className="flex animate-marquee gap-4">
            {doubled.map((tech, i) => (
              <div
                key={`${tech}-${i}`}
                className="flex-shrink-0 px-5 py-2.5 glass-card text-sm font-mono text-gray-400 hover:text-circuit-400 hover:border-circuit-500/20 transition-all duration-300 cursor-default whitespace-nowrap"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Second row — right to left */}
        <div className="relative mt-4">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-carbon-500 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-carbon-500 to-transparent z-10" />

          <div className="flex gap-4" style={{ animation: "marquee 45s linear infinite reverse" }}>
            {[...doubled].reverse().map((tech, i) => (
              <div
                key={`${tech}-rev-${i}`}
                className="flex-shrink-0 px-5 py-2.5 glass-card text-sm font-mono text-gray-400 hover:text-circuit-400 hover:border-circuit-500/20 transition-all duration-300 cursor-default whitespace-nowrap"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
