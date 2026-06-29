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
import { ArrowRight, Globe, ChevronDown, BarChart3 } from "lucide-react";
import MagneticButton from "./MagneticButton";

const stats = [
  { value: 100, suffix: "", label: "Lighthouse score" },
  { value: 24, suffix: "/7", label: "AI call coverage" },
  { value: 100, suffix: "%", label: "Source code you own" },
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
              WEBSITES · SEO · AI · APPS · HARDWARE
            </motion.div>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] tracking-tight mb-8">
              <WordReveal
                text="We build"
                className="text-gradient-bright block"
                delay={0.3}
              />
              <WordReveal
                text="the local edge"
                className="text-gradient block"
                delay={0.55}
              />
              <WordReveal
                text="that wins the job."
                className="text-gradient-bright block"
                delay={0.8}
              />
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="text-lg sm:text-xl text-gray-200 max-w-lg mb-10 leading-relaxed"
            >
              Bespoke local search engines, autonomous lead capture, and a 24/7
              bilingual AI phone agent — engineered for{" "}
              <span className="text-circuit-300 font-semibold">auto body, contractors, and high-ticket trades</span>.
              No platform lock-in. You own everything we build.
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
                href="tel:+17605469189"
                className="group flex items-center justify-center gap-2 px-8 py-4 glass-card text-gray-100 font-medium hover:text-white hover:border-circuit-500/30 transition-all duration-300"
                strength={0.35}
              >
                <span className="w-2 h-2 rounded-full bg-circuit-500/50 group-hover:bg-circuit-500 transition-colors" />
                Hear our AI receptionist
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
              {/* Dashboard header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-circuit-400" />
                  <span className="text-sm font-semibold text-white">Lead Performance</span>
                </div>
                <span className="text-[10px] font-mono text-circuit-300 flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-circuit-500" />
                  </span>
                  LIVE
                </span>
              </div>

              {/* Dashboard body */}
              <div className="p-5 space-y-4 min-h-[320px]">
                {/* Stylized region map — local map-pack coverage */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="relative h-36 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a1020]"
                >
                  <div
                    className="absolute inset-0 opacity-[0.13]"
                    style={{
                      backgroundImage:
                        "linear-gradient(#3b4a6b 1px,transparent 1px),linear-gradient(90deg,#3b4a6b 1px,transparent 1px)",
                      backgroundSize: "26px 26px",
                    }}
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-circuit-500/15 blur-2xl" />
                  <span className="absolute left-[22%] top-[30%] w-2 h-2 rounded-full bg-gray-500" />
                  <span className="absolute left-[72%] top-[26%] w-2 h-2 rounded-full bg-gray-500" />
                  <span className="absolute left-[78%] top-[64%] w-2 h-2 rounded-full bg-gray-500" />
                  <span className="absolute left-[28%] top-[68%] w-2 h-2 rounded-full bg-gray-500" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-circuit-400 border-2 border-white/40" />
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-3 text-[10px] font-mono text-gray-400">
                    Local map pack · your region
                  </div>
                </motion.div>

                {/* Operational metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between glass-card px-4 py-2.5">
                    <span className="text-xs text-gray-300">Local Map Pack Dominance</span>
                    <span className="text-base font-bold text-circuit-300">98.4%</span>
                  </div>
                  <div className="flex items-center justify-between glass-card px-4 py-2.5">
                    <span className="text-xs text-gray-300">Missed Calls Recovered by AI (mo.)</span>
                    <span className="text-base font-bold text-white">42</span>
                  </div>
                  <div className="flex items-center justify-between glass-card px-4 py-2.5">
                    <span className="text-xs text-gray-300">Mobile Paint-Load Latency</span>
                    <span className="text-base font-bold text-white">&lt;1.2s</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center backdrop-blur-sm"
              animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Globe className="w-8 h-8 text-circuit-500/50" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-sm"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">Calls answered</div>
              <div className="text-sm font-bold text-white font-mono">24/7</div>
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

