"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 });
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 });

  const trailX = useSpring(cursorX, { damping: 40, stiffness: 150 });
  const trailY = useSpring(cursorY, { damping: 40, stiffness: 150 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, .magnetic-btn")
      ) {
        setIsHovering(true);
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, .magnetic-btn")
      ) {
        setIsHovering(false);
      }
    };

    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [cursorX, cursorY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Main dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY }}
      >
        <motion.div
          animate={{
            width: isHovering ? 48 : isClicking ? 6 : 10,
            height: isHovering ? 48 : isClicking ? 6 : 10,
            borderRadius: "50%",
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-circuit-400 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: isHovering ? 0.3 : 0.9 }}
        />
      </motion.div>

      {/* Trail ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: trailX, y: trailY }}
      >
        <motion.div
          animate={{
            width: isHovering ? 64 : 36,
            height: isHovering ? 64 : 36,
            borderColor: isHovering ? "rgba(0,230,138,0.5)" : "rgba(0,230,138,0.2)",
          }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="border rounded-full -translate-x-1/2 -translate-y-1/2"
        />
      </motion.div>
    </>
  );
}
