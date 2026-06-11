"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  type Variants,
} from "framer-motion";
import { ArrowRight, Terminal, Cpu, Wifi, ChevronDown } from "lucide-react";
import MagneticButton from "./MagneticButton";

const stats = [
  { value: 50, suffix: "+", label: "Projects Shipped" },
  { value: 12, suffix: "", label: "Hardware Products" },
  { value: 99.8, suffix: "%", label: "Uptime SLA" },
];

function AnimatedCounter({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Number.isInteger(value) ? Math.floor(current) : Number(current.toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, value]);

  return (
    <span className="text-3xl sm:text-4xl font-bold text-white font-mono tabular-nums">
      {count}{suffix}
    </span>
  );
}

const wordContainer: Variants = {
  hidden: {},
  show: (delay: number = 0) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
};

const wordItem: Variants = {
  hidden: { opacity: 0, y: "110%", rotateX: -40 },
  show: {
    opacity: 1,
    y: "0%",
    rotateX: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block", perspective: 1000 }}
      variants={wordContainer}
      initial="hidden"
      animate="show"
      custom={delay}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          <motion.span
            variants={wordItem}
            style={{ display: "inline-block", transformOrigin: "bottom" }}
          >
            {word}
            {i < words.length - 1 && " "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [5, -5]);
  const rotateY = useTransform(springX, [-300, 300], [-5, 5]);

  // Scroll-linked parallax across the hero section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const terminalY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const terminalOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 0]);
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
      onMouseMove={handleMouse}
    >
      {/* Hero glow — parallaxed */}
      <motion.div
        style={{ y: glowY, opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-radial-glow pointer-events-none"
      />

      {/* Ambient floating orbs */}
      <motion.div
        aria-hidden
        className="absolute left-[10%] top-[20%] w-64 h-64 rounded-full bg-circuit-500/10 blur-[80px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[8%] bottom-[15%] w-80 h-80 rounded-full bg-cyan-500/[0.06] blur-[90px] pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div style={{ y: copyY }} className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card text-xs font-mono text-circuit-300 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit-500" />
              </span>
              HARDWARE + SOFTWARE ENGINEERING
            </motion.div>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] tracking-tight mb-8">
              <WordReveal
                text="We build"
                className="text-gradient-bright block"
                delay={0.3}
              />
              <WordReveal
                text="what others"
                className="text-gradient block"
                delay={0.55}
              />
              <span className="block">
                <WordReveal
                  text="can't"
                  className="text-gradient-bright"
                  delay={0.8}
                />
                {" "}
                <WordReveal
                  text="imagine."
                  className="text-gray-400 italic font-light"
                  delay={0.95}
                />
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="text-lg sm:text-xl text-gray-200 max-w-lg mb-10 leading-relaxed"
            >
              Custom business websites from <span className="text-circuit-300 font-semibold">$499 flat</span>,
              scaling to <span className="text-circuit-300 font-semibold">$2,500 full-stack builds</span> in 10-14 days.
              Plus hardware, PCBs, and IoT platforms when you need the whole
              stack. One team. Startup speed. Enterprise quality.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <MagneticButton
                href="#website-demos"
                className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-circuit-500 text-carbon-500 font-semibold rounded-xl overflow-hidden transition-all duration-300"
                strength={0.35}
              >
                <span className="relative z-10 flex items-center gap-2">
                  See Live Demos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 shadow-[0_0_40px_rgba(0,230,138,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                  }}
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                />
              </MagneticButton>
              <MagneticButton
                href="#mockup"
                className="group flex items-center justify-center gap-2 px-8 py-4 glass-card text-gray-100 font-medium hover:text-white hover:border-circuit-500/30 transition-all duration-300"
                strength={0.35}
              >
                <span className="w-2 h-2 rounded-full bg-circuit-500/50 group-hover:bg-circuit-500 transition-colors" />
                Hardware Mockup Studio
              </MagneticButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 1.6 } },
              }}
              className="flex gap-10 sm:gap-14 mt-16"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="relative group"
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} delay={1.8 + i * 0.2} />
                  <div className="text-xs text-gray-300 mt-1.5 font-medium tracking-wide uppercase">{stat.label}</div>
                  {/* Accent underline on hover */}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-circuit-500 to-transparent group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — 3D Terminal mockup — scroll-parallaxed */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1200,
              y: terminalY,
              opacity: terminalOpacity,
            }}
            className="relative hidden lg:block"
          >
            {/* Glow behind terminal */}
            <div className="absolute -inset-4 bg-circuit-500/5 rounded-3xl blur-2xl" />

            {/* Animated conic gradient ring */}
            <motion.div
              aria-hidden
              className="absolute -inset-[2px] rounded-3xl pointer-events-none opacity-40"
              style={{
                background:
                  "conic-gradient(from var(--angle, 0deg), rgba(0,230,138,0.35), transparent 25%, transparent 75%, rgba(103,232,255,0.35))",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: "1px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative glass-card p-1 glow-border-intense">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70 hover:bg-green-400 transition-colors cursor-pointer" />
                </div>
                <span className="text-xs font-mono text-gray-300 ml-2 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  ~/circuit-coders
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-sm space-y-3 min-h-[320px]">
                <TerminalLine delay={0.8} prompt="$" command='cc-cli design "IoT sensor array --mesh"' />
                <TerminalLine delay={1.6} prompt="" command="" />
                <TerminalLine delay={1.8} prompt="" command="Analyzing requirements..." color="text-gray-300" />
                <TerminalLine delay={2.4} prompt="" command="" />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.8, duration: 0.6 }}
                  className="glass-card p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-circuit-400 text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>ESP32-S3 x 8 nodes — mesh topology</span>
                  </div>
                  <div className="flex items-center gap-2 text-circuit-400 text-xs">
                    <Wifi className="w-4 h-4" />
                    <span>SX1276 LoRa (915MHz, 15km range)</span>
                  </div>
                  <div className="flex items-center gap-2 text-circuit-400 text-xs">
                    <Terminal className="w-4 h-4" />
                    <span>Zephyr RTOS + MQTT telemetry</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-gray-300">BOM: $68.00 per node</span>
                    <span className="text-[10px] text-circuit-300">4-layer custom PCB</span>
                  </div>
                </motion.div>

                <TerminalLine delay={3.6} prompt="" command="Generating schematic + API..." color="text-yellow-400/80" />
                <TerminalLine delay={4.2} prompt="✓" command="Preview ready — 3 views generated" color="text-circuit-400" />
                <TerminalLine delay={4.8} prompt="✓" command="Estimated timeline: 3 weeks" color="text-circuit-400" />
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center backdrop-blur-sm"
              animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cpu className="w-8 h-8 text-circuit-500/50" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-sm"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">Build time</div>
              <div className="text-sm font-bold text-white font-mono">2.4s</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: scrollCueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono text-gray-300 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-gray-300" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function TerminalLine({
  delay,
  prompt,
  command,
  color = "text-gray-300",
}: {
  delay: number;
  prompt: string;
  command: string;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex gap-2 ${color}`}
    >
      {prompt && <span className="text-circuit-600 select-none">{prompt}</span>}
      <span>{command}</span>
    </motion.div>
  );
}
