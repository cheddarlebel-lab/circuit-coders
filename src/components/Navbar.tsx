"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import MagneticButton from "./MagneticButton";

const navLinks = [
  { name: "Services", href: "/#services" },
  { name: "Demos", href: "/#website-demos" },
  { name: "Blog", href: "/blog" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          animate={{
            backgroundColor: scrolled ? "rgba(6,6,26,0.8)" : "rgba(255,255,255,0.03)",
            borderColor: scrolled ? "rgba(0,230,138,0.1)" : "rgba(255,255,255,0.06)",
          }}
          transition={{ duration: 0.3 }}
          className="mt-4 backdrop-blur-xl border rounded-2xl px-6 py-3 flex items-center justify-between"
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-circuit-500/25 border border-circuit-400/70 flex items-center justify-center group-hover:border-circuit-300 transition-colors duration-300 shadow-[0_0_20px_rgba(0,230,138,0.35)]">
                <Zap className="w-5 h-5 text-circuit-300 drop-shadow-[0_0_6px_rgba(0,230,138,0.9)]" fill="currentColor" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-circuit-500/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Circuit<span className="text-circuit-400">Coders</span>
              </span>
              <div className="text-[10px] font-mono text-circuit-300/80 tracking-widest uppercase">
                Engineering Studio
              </div>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-100 hover:text-circuit-300 transition-colors duration-300 rounded-lg hover:bg-white/[0.05] relative group font-medium"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-circuit-500 group-hover:w-3/4 transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <MagneticButton
              href="#contact"
              className="group relative px-5 py-2.5 text-sm font-medium bg-circuit-500 text-carbon-500 rounded-xl hover:bg-circuit-400 transition-all duration-300 overflow-hidden"
              strength={0.4}
            >
              <span className="relative z-10">Start a Project</span>
              <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(0,230,138,0.4)]" />
            </MagneticButton>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-100 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mx-4 mt-2 glass-card p-4"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="block px-4 py-3 text-gray-100 hover:text-circuit-300 hover:bg-white/[0.05] rounded-lg transition-colors font-medium"
              >
                {link.name}
              </motion.a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="block mt-2 px-4 py-3 text-center font-medium bg-circuit-500 text-carbon-500 rounded-xl"
            >
              Start a Project
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
