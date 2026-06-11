"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[100] pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, rgba(0,230,138,0) 0%, rgba(0,230,138,0.9) 40%, rgba(103,232,255,1) 70%, rgba(0,230,138,0) 100%)",
        boxShadow: "0 0 18px rgba(0,230,138,0.55), 0 0 2px rgba(0,230,138,0.8)",
      }}
    />
  );
}
