"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 800;
    const interval = 20;
    let current = 0;

    const timer = setInterval(() => {
      current += interval;
      // Ease-out progress curve
      const t = current / duration;
      setProgress(Math.min(100, Math.round(t * t * (3 - 2 * t) * 100)));

      if (current >= duration) {
        clearInterval(timer);
        setTimeout(() => setLoading(false), 100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          exit={{ opacity: 0, pointerEvents: 'none' as const }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-carbon-500 flex flex-col items-center justify-center"
        >
          {/* Logo pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-circuit-500/10 border border-circuit-500/30 flex items-center justify-center">
              <Zap className="w-10 h-10 text-circuit-400" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl bg-circuit-500/20 blur-xl"
            />
          </motion.div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="text-2xl font-bold text-white">
              Circuit<span className="text-circuit-400">Coders</span>
            </span>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-circuit-500 to-circuit-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </motion.div>

          {/* Percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs font-mono text-gray-600"
          >
            {progress}%
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
