"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, X, CheckCircle, Cpu, Server, CircuitBoard, Monitor, Radio, Compass, Cog, Battery } from "lucide-react";
import { hardwareComponents } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Cpu, Radio, Monitor, Compass, Cog, Battery, Server, CircuitBoard,
};

const projectTypes = [
  { id: "hardware", label: "Hardware Only", icon: CircuitBoard },
  { id: "software", label: "Software Only", icon: Monitor },
  { id: "integrated", label: "Full Stack", icon: Server },
  { id: "consultation", label: "Consultation", icon: Compass },
];

const budgetRanges = [
  "Under $500",
  "$500 - $2,500",
  "$2,500 - $10,000",
  "$10,000 - $50,000",
  "$50,000+",
];

const timelines = [
  "ASAP (Rush)",
  "2-4 weeks",
  "1-3 months",
  "3-6 months",
  "Flexible",
];

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
    components: [] as string[],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleComponent = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.includes(id)
        ? prev.components.filter((c) => c !== id)
        : [...prev.components, id],
    }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <section id="contact" className="relative py-32 px-4">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-circuit-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 glass-card text-xs font-mono text-circuit-400 mb-6">
            START A PROJECT
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-subtle">Tell Us What You&apos;re</span>{" "}
            <span className="text-gradient">Building</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Share your requirements, upload specs, and select hardware
            components. We&apos;ll respond with a detailed proposal within 24 hours.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 text-circuit-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Inquiry Received!</h3>
              <p className="text-gray-400 mb-8">
                We&apos;ll review your requirements and get back to you within 24
                hours with a detailed proposal.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", company: "", projectType: "", budget: "", timeline: "", description: "", components: [] }); setFiles([]); }}
                className="px-6 py-3 glass-card text-gray-400 hover:text-white transition-colors"
              >
                Submit Another Inquiry
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
              {/* Basic info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all"
                  placeholder="Optional"
                />
              </div>

              {/* Project type */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 font-medium">Project Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectType: type.id })}
                      className={`p-4 rounded-xl border text-center transition-all duration-300 hover-lift ${
                        formData.projectType === type.id
                          ? "bg-circuit-500/10 border-circuit-500/40 text-circuit-400 shadow-[0_0_15px_rgba(0,230,138,0.1)]"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:border-white/10"
                      }`}
                    >
                      <type.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Budget Range *</label>
                  <select
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-circuit-500/40 transition-all appearance-none"
                  >
                    <option value="" className="bg-carbon-400">Select budget</option>
                    {budgetRanges.map((b) => (
                      <option key={b} value={b} className="bg-carbon-400">{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Timeline</label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-circuit-500/40 transition-all appearance-none"
                  >
                    <option value="" className="bg-carbon-400">Select timeline</option>
                    {timelines.map((t) => (
                      <option key={t} value={t} className="bg-carbon-400">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hardware components */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 font-medium">
                  Hardware Components <span className="text-gray-600 font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {hardwareComponents.map((comp) => {
                    const Icon = iconMap[comp.icon] || Cpu;
                    const selected = formData.components.includes(comp.id);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => toggleComponent(comp.id)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all duration-300 ${
                          selected
                            ? "bg-circuit-500/10 border-circuit-500/30 text-circuit-400"
                            : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:border-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <div className="font-medium">{comp.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Project Description *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-circuit-500/40 focus:ring-1 focus:ring-circuit-500/20 transition-all resize-none"
                  placeholder="Describe your project requirements, use case, and any technical constraints..."
                />
              </div>

              {/* File uploads */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">
                  Attachments <span className="text-gray-600 font-normal">(schematics, specs, reference docs)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center cursor-pointer hover:border-circuit-500/30 hover:bg-white/[0.01] transition-all duration-300 group"
                >
                  <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-circuit-500/50 group-hover:scale-110 transition-all" />
                  <p className="text-sm text-gray-500">
                    Click to upload or drag files here
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    PDF, KiCad, Eagle, Gerber, images (max 10MB each)
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                  accept=".pdf,.kicad_pcb,.brd,.sch,.gbr,.zip,.png,.jpg"
                />
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                        <span className="text-sm text-gray-400 truncate">{file.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
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
                      Submit Inquiry
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 shadow-[0_0_40px_rgba(0,230,138,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
