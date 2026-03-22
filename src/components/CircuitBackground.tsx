"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 20000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 230, 138, ${o})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 230, 138, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function CircuitBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Particle field */}
      <ParticleField />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute top-[10%] left-[20%] w-[800px] h-[800px] rounded-full bg-circuit-500/[0.04] blur-[150px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-circuit-600/[0.04] blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], x: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.02] blur-[100px]"
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Circuit trace SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        {[
          "M 100 200 L 300 200 L 300 400 L 500 400",
          "M 800 100 L 800 300 L 600 300 L 600 500",
          "M 200 600 L 400 600 L 400 800 L 700 800",
          "M 900 500 L 1100 500 L 1100 200 L 1300 200",
          "M 50 400 L 250 400 L 250 100 L 450 100",
          "M 1000 700 L 1200 700 L 1200 400 L 1400 400",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="rgba(0,230,138,0.2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, delay: i * 1.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          />
        ))}
      </svg>

      {/* Dual scanlines */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent"
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
        animate={{ top: ["102%", "-2%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,6,26,0.4)_70%,rgba(6,6,26,0.8)_100%)]" />
    </div>
  );
}
