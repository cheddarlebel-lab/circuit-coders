"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
};

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const sx = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.3 });
  const sy = useSpring(my, { stiffness: 220, damping: 22, mass: 0.3 });

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);

  const spotlightX = useTransform(mx, (v) => `${v * 100}%`);
  const spotlightY = useTransform(my, (v) => `${v * 100}%`);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [spotlightX, spotlightY] as never,
            ([x, y]: string[]) =>
              `radial-gradient(420px circle at ${x} ${y}, rgba(0,230,138,0.18), transparent 45%)`,
          ),
        }}
      />
    </motion.div>
  );
}
