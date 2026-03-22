"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { MessageSquare, Cpu, Code, Rocket, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discovery Call",
    description: "We listen. You describe the problem, the constraints, and the dream. We ask the hard questions upfront so there are zero surprises later.",
    icon: MessageSquare,
    details: ["Requirements deep-dive", "Feasibility analysis", "Architecture proposal", "Timeline & budget"],
    color: "from-blue-500 to-cyan-400",
  },
  {
    number: "02",
    title: "Design & Prototype",
    description: "Hardware schematics, firmware architecture, and UI mockups — all reviewed with you before a single line of production code is written.",
    icon: Cpu,
    details: ["Schematic review", "PCB layout", "Firmware architecture", "Interactive mockups"],
    color: "from-purple-500 to-violet-400",
  },
  {
    number: "03",
    title: "Build & Iterate",
    description: "We build in tight loops. Weekly demos, daily commits, and real hardware in your hands within weeks — not months.",
    icon: Code,
    details: ["Weekly progress demos", "Git-based collaboration", "Continuous integration", "Hardware-in-the-loop testing"],
    color: "from-emerald-500 to-green-400",
  },
  {
    number: "04",
    title: "Ship & Support",
    description: "Production firmware, deployment pipelines, OTA updates, and monitoring. We don't just hand off — we make sure it works in the wild.",
    icon: Rocket,
    details: ["Production deployment", "OTA update system", "Monitoring & alerting", "90-day priority support"],
    color: "from-orange-500 to-amber-400",
  },
];

function ProcessStep({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="grid md:grid-cols-12 gap-8 items-center">
        {/* Number side */}
        <div className={`md:col-span-2 ${index % 2 === 0 ? "" : "md:order-last"}`}>
          <div className={`text-7xl sm:text-8xl font-black bg-gradient-to-b ${step.color} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-500 select-none`}>
            {step.number}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-10">
          <div className="glass-card-hover p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className={`absolute top-0 ${index % 2 === 0 ? "right-0" : "left-0"} w-40 h-40 bg-gradient-to-br ${step.color} opacity-[0.03] rounded-full blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700`} />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-[1px]`}>
                  <div className="w-full h-full rounded-xl bg-carbon-400 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">{step.title}</h3>
              </div>

              <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">
                {step.description}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {step.details.map((detail) => (
                  <div key={detail} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-3.5 h-3.5 text-circuit-500 flex-shrink-0" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Process() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative py-32 px-4" ref={containerRef}>
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-400 mb-6">
            HOW WE WORK
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-subtle">Idea to Product in</span>{" "}
            <span className="text-gradient">4 Steps</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            No bloated timelines. No endless meetings. Just focused engineering
            with constant communication and weekly deliverables.
          </p>
        </motion.div>

        {/* Progress line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-[280px] bottom-[100px] w-px bg-white/[0.04]">
          <motion.div
            className="w-full bg-gradient-to-b from-circuit-500 to-circuit-500/0"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-12 relative">
          {steps.map((step, i) => (
            <ProcessStep key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
