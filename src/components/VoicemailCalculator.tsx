"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, PhoneCall, TrendingDown } from "lucide-react";

const industries = [
  { id: "collision", label: "Collision Repair", value: 4500 },
  { id: "contractor", label: "General Contractor", value: 6000 },
  { id: "hvac", label: "HVAC / Plumbing", value: 1200 },
  { id: "detailing", label: "Detailing / Specialty", value: 350 },
];

const fmt = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

export default function VoicemailCalculator() {
  const [industryId, setIndustryId] = useState("collision");
  const [jobValue, setJobValue] = useState(4500);
  const [missedPerWeek, setMissedPerWeek] = useState(3);

  const pickIndustry = (id: string, value: number) => {
    setIndustryId(id);
    setJobValue(value);
  };

  // Conservative: assume 1 in 3 missed calls would have become a booked job.
  const weeklyLeak = jobValue * missedPerWeek * (1 / 3);
  const annualLeak = weeklyLeak * 52;

  return (
    <section id="leak-calculator" className="relative py-28 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
            <Calculator className="w-3.5 h-3.5" />
            THE VOICEMAIL LEAK CALCULATOR
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            <span className="text-gradient-bright">How much is voicemail</span>{" "}
            <span className="text-gradient">costing you?</span>
          </h2>
          <p className="text-gray-200 max-w-xl mx-auto text-lg leading-relaxed">
            Every call that rolls to voicemail is a job that may never call back. Run the math on your own shop.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Inputs */}
          <div className="glass-card rounded-2xl p-7 space-y-7">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-3 font-semibold">Your industry</label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => pickIndustry(ind.id, ind.value)}
                    className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                      industryId === ind.id
                        ? "bg-circuit-500/10 border-circuit-500/40 text-circuit-300"
                        : "bg-white/[0.02] border-white/[0.08] text-gray-100 hover:border-white/20"
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-3 font-semibold">
                Average job value
              </label>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">$</span>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={jobValue}
                  onChange={(e) => setJobValue(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-xl font-bold focus:outline-none focus:border-circuit-500/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-gray-100 mb-3 font-semibold">
                <span>Missed calls / week</span>
                <span className="text-circuit-300 text-lg font-bold normal-case">{missedPerWeek}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={missedPerWeek}
                onChange={(e) => setMissedPerWeek(Number(e.target.value))}
                className="w-full accent-circuit-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1</span>
                <span>20+</span>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="relative glass-card rounded-2xl p-7 flex flex-col justify-center overflow-hidden border-circuit-400/40">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-circuit-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gray-300 font-semibold mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Revenue leaking to voicemail
              </div>
              <div className="text-5xl sm:text-6xl font-bold text-white tracking-tight tabular-nums">
                {fmt(weeklyLeak)}
                <span className="text-2xl text-gray-300 font-semibold"> /wk</span>
              </div>
              <div className="text-lg text-circuit-300 font-semibold mt-2 tabular-nums">
                {fmt(annualLeak)} a year
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Conservative estimate — assumes just 1 in 3 missed calls would have booked.
              </p>

              <a
                href="tel:+17605469189"
                className="group mt-7 inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-circuit-500 text-carbon-500 font-bold rounded-xl hover:bg-circuit-400 transition-all duration-300"
              >
                <PhoneCall className="w-5 h-5" />
                Plug the gap — hear the AI receptionist
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
