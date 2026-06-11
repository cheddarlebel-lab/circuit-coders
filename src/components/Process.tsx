"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";
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
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromLeft ? -80 : 80, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="grid md:grid-cols-12 gap-8 items-center">
        {/* Number side */}
        <div className={`md:col-span-2 ${fromLeft ? "" : "md:order-last"}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05, opacity: 1 }}
            className={`text-7xl sm:text-8xl font-black bg-gradient-to-b ${step.color} bg-clip-text text-transparent group-hover:opacity-90 transition-opacity duration-500 select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]`}
          >
            {step.number}
          </motion.div>
        </div>

        {/* Content */}
        <div className="md:col-span-10">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card-hover p-8 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className={`absolute top-0 ${fromLeft ? "right-0" : "left-0"} w-40 h-40 bg-gradient-to-br ${step.color} opacity-[0.03] rounded-full blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700`} />

            {/* Scan line accent */}
            <motion.div
              aria-hidden
              className="absolute inset-x-0 h-px pointer-events-none opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(0,230,138,0.6), transparent)`,
              }}
              initial={{ top: "-10%" }}
              animate={isInView ? { top: "110%" } : {}}
              transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={isInView ? { rotate: 0, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-[1px]`}
                >
                  <div className="w-full h-full rounded-xl bg-carbon-400 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-2xl font-bold text-white"
                >
                  {step.title}
                </motion.h3>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-gray-200 leading-relaxed mb-6 max-w-2xl"
              >
                {step.description}
              </motion.p>

              <motion.div
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } },
                }}
                className="grid grid-cols-2 gap-2"
              >
                {step.details.map((detail) => (
                  <motion.div
                    key={detail}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className="flex items-center gap-2 text-sm text-gray-100"
                  >
                    <Check className="w-3.5 h-3.5 text-circuit-300 flex-shrink-0" />
                    {detail}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
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
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    mass: 0.4,
  });
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6"
          >
            HOW WE WORK
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">Idea to Product in</span>{" "}
            <span className="text-gradient">4 Steps</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            No bloated timelines. No endless meetings. Just focused engineering
            with constant communication and weekly deliverables.
          </p>
        </motion.div>

        {/* Progress line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-[280px] bottom-[100px] w-px bg-white/[0.04]">
          <motion.div
            className="w-full bg-gradient-to-b from-circuit-500 via-circuit-400 to-circuit-500/0 shadow-[0_0_14px_rgba(0,230,138,0.45)]"
            style={{ height: lineHeight }}
          />
          {/* Traveling pulse */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-circuit-400 shadow-[0_0_18px_rgba(0,230,138,0.9)]"
            style={{ top: lineHeight }}
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
