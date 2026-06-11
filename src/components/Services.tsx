"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { CircuitBoard, Code, Globe, Brain, Store, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  CircuitBoard,
  Code,
  Globe,
  Brain,
  Store,
};

type Service = (typeof services)[number];

function ServiceCard({
  service,
  index,
  spanFull,
}: {
  service: Service;
  index: number;
  spanFull: boolean;
}) {
  const Icon = iconMap[service.icon];
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 22, mass: 0.3 };
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), spring);
  const spotX = useTransform(mx, (v) => `${v * 100}%`);
  const spotY = useTransform(my, (v) => `${v * 100}%`);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
    el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        delay: (index % 2) * 0.12,
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      className={`group relative glass-card-hover p-8 overflow-hidden card-spotlight hover-lift ${spanFull ? "md:col-span-2" : ""}`}
    >
      {/* Mouse-follow spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [spotX, spotY] as never,
            ([x, y]: string[]) =>
              `radial-gradient(500px circle at ${x} ${y}, rgba(0,230,138,0.12), transparent 45%)`,
          ),
        }}
      />

      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-circuit-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Shimmer on hover */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-start justify-between mb-6">
          <motion.div
            whileHover={{ rotate: [0, -6, 6, -4, 0], scale: 1.08 }}
            transition={{ duration: 0.6 }}
            className="w-14 h-14 rounded-2xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center group-hover:border-circuit-500/40 group-hover:bg-circuit-500/15 transition-colors duration-500 relative"
          >
            <Icon className="w-7 h-7 text-circuit-400 group-hover:text-circuit-300 transition-colors duration-500" />
            {/* Icon glow pulse */}
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-circuit-500/20 blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            />
          </motion.div>
          <motion.div
            className="text-gray-600 group-hover:text-circuit-400 transition-colors duration-300"
            whileHover={{ x: 4, y: -4, rotate: 8 }}
          >
            <ArrowUpRight className="w-5 h-5" />
          </motion.div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-circuit-100 transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-200 mb-6 leading-relaxed">
          {service.description}
        </p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
          }}
          className="grid grid-cols-2 gap-2"
        >
          {service.features.map((feature) => (
            <motion.div
              key={feature}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex items-center gap-2 text-sm text-gray-100 group-hover:text-white transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-circuit-400 group-hover:bg-circuit-300 group-hover:shadow-[0_0_8px_rgba(0,230,138,0.7)] transition-all" />
              {feature}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const isOddCount = services.length % 2 !== 0;

  return (
    <section id="services" className="relative py-32 px-4">
      {/* Divider line */}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6"
          >
            WHAT WE BUILD
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">From Schematic to</span>{" "}
            <span className="text-gradient">Shipped Product</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            Full-stack engineering that bridges the gap between digital code and
            physical hardware. No hand-offs — we own the entire stack.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6" style={{ perspective: 1200 }}>
          {services.map((service, i) => {
            const isLast = i === services.length - 1;
            const spanFull = isLast && isOddCount;
            return (
              <ServiceCard
                key={service.title}
                service={service}
                index={i}
                spanFull={spanFull}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
