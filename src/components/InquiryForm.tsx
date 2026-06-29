"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Car, HardHat, Sparkles, Building2, Gauge, MapPin, PhoneOff } from "lucide-react";

const businessTypes = [
  { id: "collision", label: "Auto Body / Collision", icon: Car },
  { id: "contractor", label: "Contractor / Trades", icon: HardHat },
  { id: "specialty", label: "Detailing / Specialty", icon: Sparkles },
  { id: "other", label: "Other Local Biz", icon: Building2 },
];

const auditChecks = [
  { icon: Gauge, label: "Mobile latency test" },
  { icon: MapPin, label: "Map-pack vs. top 3 rivals" },
  { icon: PhoneOff, label: "Missed-call leak map" },
];

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    businessType: "",
    website: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const missing: string[] = [];
    if (!formData.name.trim()) missing.push("Name");
    if (!formData.email.trim()) missing.push("Email");
    if (!formData.businessType) missing.push("Business Type");
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, requestType: "Local Pipeline Audit" }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server error ${res.status}: ${body}`);
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Something went wrong: ${msg}. Please try again or email us directly at admin@circuitcoders.com`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-circuit-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-300 tracking-widest mb-6">
            FREE PIPELINE AUDIT
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-bright">Request a Local</span>{" "}
            <span className="text-gradient">Pipeline Audit</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
            We&apos;ll run a latency test on your mobile presence, track your local
            map-pack position against your top 3 competitors, and map your
            missed-call leak vulnerabilities — delivered within 24 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8">
            {auditChecks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm text-gray-200">
                <c.icon className="w-4 h-4 text-circuit-400" />
                {c.label}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-16 text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <CheckCircle className="w-20 h-20 text-circuit-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Audit requested.</h3>
              <p className="text-gray-200 mb-8">
                We&apos;ll run your latency, map-pack, and missed-call audit and send
                the findings over within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", company: "", businessType: "", website: "", description: "" }); }}
                className="px-6 py-3 glass-card text-gray-100 hover:text-white transition-colors"
              >
                Request another audit
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 sm:p-10 space-y-8 glow-border"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="you@yourshop.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">Business name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="Your shop"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">
                    Current website <span className="text-gray-300 font-normal normal-case tracking-normal">(so we can audit it)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="yourshop.com (or 'none yet')"
                  />
                </div>
              </div>

              {/* Business type */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-3 font-semibold">Business type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`p-4 rounded-xl border text-center transition-all duration-300 hover-lift ${
                        formData.businessType === type.id
                          ? "bg-circuit-500/10 border-circuit-500/40 text-circuit-400 shadow-[0_0_15px_rgba(0,230,138,0.1)]"
                          : "bg-white/[0.02] border-white/[0.08] text-gray-100 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <type.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* What's leaking */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-100 mb-2 font-semibold">
                  What&apos;s leaking right now? <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all resize-none"
                  placeholder="Missed calls during business hours? Not showing up on Google? Slow site? Tell us where you think you're losing jobs..."
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group w-full py-4 bg-circuit-500 text-carbon-500 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-carbon-500/30 border-t-carbon-500 rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Request my free audit
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 shadow-[0_0_40px_rgba(0,230,138,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <p className="text-center text-xs text-gray-400">
                No cost, no obligation. We&apos;ll send the findings within 24 hours.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
