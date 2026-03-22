"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, TrendingUp, Layers, Smartphone, Zap, Code,
  ArrowRight, ChevronLeft, ChevronRight, Pause, Play,
} from "lucide-react";
import { portfolioProjects } from "@/lib/data";
import type { PortfolioProject } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  Network, TrendingUp, Layers, Smartphone, Zap, Code,
};

const CARD_W = 420;
const CARD_SPACING = 480; // center-to-center distance between cards

/* ─── Single carousel card ─── */
function CarouselCard({
  project,
  offset, // continuous float: 0 = dead center, ±1 = one card away, etc.
}: {
  project: PortfolioProject;
  offset: number;
}) {
  const Icon = iconMap[project.icon] || Zap;
  const absOffset = Math.abs(offset);

  if (absOffset > 2.5) return null;

  // Smooth interpolation based on continuous offset
  const xPx = offset * CARD_SPACING;
  const scale = Math.max(0.6, 1 - absOffset * 0.18);
  const opacity = Math.max(0, 1 - absOffset * 0.45);
  const blur = Math.min(absOffset * 3, 6);
  const zIndex = Math.round(30 - absOffset * 10);
  const isCenter = absOffset < 0.5;

  return (
    <div
      className="absolute top-0 left-1/2 -ml-[210px] w-[420px] pointer-events-auto"
      style={{
        transform: `translateX(${xPx}px) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        zIndex,
        transition: "none", // no CSS transition, we animate via JS
      }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
          isCenter
            ? "bg-[#0c0c24] border-circuit-500/25 shadow-[0_0_80px_rgba(0,230,138,0.08)]"
            : "bg-[#0a0a1e] border-white/[0.05]"
        }`}
      >
        {/* Top gradient bar */}
        <div className={`h-1 bg-gradient-to-r ${project.color}`} />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} p-[1px] flex-shrink-0`}>
              <div className="w-full h-full rounded-xl bg-carbon-400 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className={`text-lg font-bold truncate transition-colors duration-300 ${
                isCenter ? "text-white" : "text-gray-500"
              }`}>
                {project.title}
              </h3>
              <p className="text-xs font-mono text-gray-500 truncate">{project.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 line-clamp-3 ${
            isCenter ? "text-gray-300" : "text-gray-600"
          }`}>
            {project.description}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {project.metrics.map((metric) => (
              <div
                key={metric.label}
                className={`p-2.5 rounded-xl border transition-colors duration-300 ${
                  isCenter
                    ? "bg-white/[0.04] border-white/[0.08]"
                    : "bg-white/[0.01] border-white/[0.03]"
                }`}
              >
                <div className={`text-base font-bold font-mono transition-colors duration-300 ${
                  isCenter ? "text-white" : "text-gray-600"
                }`}>
                  {metric.value}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition-colors duration-300 ${
                  isCenter
                    ? "bg-white/[0.04] text-gray-400 border-white/[0.08]"
                    : "bg-white/[0.02] text-gray-600 border-white/[0.03]"
                }`}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Features — visible when near center */}
          <AnimatePresence>
            {isCenter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-white/[0.06] space-y-2">
                  {project.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-gray-400">
                      <ChevronRight className="w-3 h-3 text-circuit-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Main carousel ─── */
export default function Portfolio() {
  const total = portfolioProjects.length;
  const [scrollPos, setScrollPos] = useState(0); // continuous float position
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scrollPosRef = useRef(0); // mirror of scrollPos for rAF

  const SPEED = 0.15; // cards per second — slow constant drift

  // Continuous animation loop
  useEffect(() => {
    if (isPaused || isHovering) {
      lastTimeRef.current = 0;
      return;
    }

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = time;

      scrollPosRef.current += SPEED * dt;
      // Wrap around
      if (scrollPosRef.current >= total) {
        scrollPosRef.current -= total;
      }
      setScrollPos(scrollPosRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, isHovering, total]);

  // Manual navigation: snap to nearest card
  const goTo = useCallback((index: number) => {
    const wrapped = ((index % total) + total) % total;
    scrollPosRef.current = wrapped;
    setScrollPos(wrapped);
  }, [total]);

  const currentIndex = Math.round(scrollPos) % total;

  const prev = useCallback(() => {
    goTo(Math.round(scrollPosRef.current) - 1);
  }, [goTo]);

  const next = useCallback(() => {
    goTo(Math.round(scrollPosRef.current) + 1);
  }, [goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  // Get continuous offset for each card
  const getOffset = (index: number) => {
    let diff = index - scrollPos;
    // Wrap for circular
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section id="portfolio" className="relative py-32 px-4 overflow-hidden">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-400 mb-6">
            PORTFOLIO
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-subtle">Real Projects.</span>{" "}
            <span className="text-gradient">Shipped.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Every project here was designed, built, and deployed by our two-person team.
            Full-stack, end-to-end, from database to deployment.
          </p>
        </motion.div>

        {/* Carousel wrapper */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Carousel viewport */}
          <div className="relative mx-auto overflow-hidden" style={{ height: 600 }}>
            {portfolioProjects.map((project, i) => (
              <CarouselCard
                key={project.id}
                project={project}
                offset={getOffset(i)}
              />
            ))}

            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-carbon-500 via-carbon-500/80 to-transparent z-40 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-carbon-500 via-carbon-500/80 to-transparent z-40 pointer-events-none" />
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-circuit-400 hover:border-circuit-500/30 transition-all duration-300"
            aria-label="Previous project"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-circuit-400 hover:border-circuit-500/30 transition-all duration-300"
            aria-label="Next project"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-8 h-2.5 bg-circuit-500 shadow-[0_0_10px_rgba(0,230,138,0.4)]"
                    : "w-2.5 h-2.5 bg-white/10 hover:bg-white/20"
                }`}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-gray-500 hover:text-circuit-400 hover:border-circuit-500/20 transition-all duration-300"
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-center mt-4">
          <span className="text-xs font-mono text-gray-600">
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-10"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 px-8 py-4 glass-card text-gray-300 hover:text-circuit-400 hover:border-circuit-500/20 transition-all duration-300"
          >
            Have a project in mind? Let&apos;s talk
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
