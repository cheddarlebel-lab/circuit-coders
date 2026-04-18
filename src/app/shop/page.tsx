"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Printer,
  Palette,
  QrCode,
  CreditCard,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Mail,
  User,
  Building2,
  MessageSquare,
  Link,
  Upload,
  FileUp,
  StickyNote,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const packs = [
  {
    id: "starter",
    name: "Starter Pack",
    quantity: 12,
    price: 29,
    description: "Single accent color (green or purple)",
    badge: null,
  },
  {
    id: "pro",
    name: "Pro Pack",
    quantity: 24,
    price: 49,
    description: "Both accent colors (12 green + 12 purple)",
    badge: "Popular",
  },
  {
    id: "bulk",
    name: "Bulk Pack",
    quantity: 48,
    price: 89,
    description: "Both colors, best value",
    badge: "Best Value",
  },
];

const features = [
  {
    icon: Printer,
    title: "Multi-Color 3D Printing",
    description: "Precision multi-material prints with vibrant accent colors that pop.",
  },
  {
    icon: QrCode,
    title: "Custom QR Code",
    description: "Embedded QR code links directly to your website, portfolio, or contact page.",
  },
  {
    icon: Palette,
    title: "Premium Materials",
    description: "Durable PLA body with flexible TPU accents for a unique tactile feel.",
  },
  {
    icon: Sparkles,
    title: "Truly Unique",
    description: "Not paper, not metal. A 3D-printed card that starts conversations.",
  },
];

const steps = [
  { number: "01", title: "Customize", description: "Fill in your details and pick your colors" },
  { number: "02", title: "We Print", description: "Each card is 3D printed to your exact specs" },
  { number: "03", title: "Ships Fast", description: "Delivered to your door in 3-5 business days" },
];

const printSizes = [
  { id: "small", label: "Small", dim: "Up to 100x100mm", price: 19.99 },
  { id: "medium", label: "Medium", dim: "Up to 200x200mm", price: 39.99 },
  { id: "large", label: "Large", dim: "Full plate 256x256mm", price: 69.99 },
];

export default function ShopPage() {
  const [tab, setTab] = useState<"cards" | "print">("cards");
  const [selectedPack, setSelectedPack] = useState("pro");
  const [accent, setAccent] = useState("green");
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [printSize, setPrintSize] = useState("medium");
  const [printMaterial, setPrintMaterial] = useState("PLA");
  const [printColors, setPrintColors] = useState("");
  const [printNotes, setPrintNotes] = useState("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    website: "",
    tagline: "",
    qr_url: "",
  });

  const selectedPackData = packs.find((p) => p.id === selectedPack)!;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCheckout() {
    if (!form.name || !form.email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          accent,
          pack: selectedPack,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadCheckout() {
    if (!uploadFile || !form.name || !form.email) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("size", printSize);
      fd.append("material", printMaterial);
      fd.append("colors", printColors);
      fd.append("notes", printNotes);
      const res = await fetch("/api/shop/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  }

  const accentColor = accent === "green" ? "text-circuit-400" : "text-purple-400";
  const accentBorder = accent === "green" ? "border-circuit-500/40" : "border-purple-500/40";
  const accentBg = accent === "green" ? "bg-circuit-500/10" : "bg-purple-500/10";

  return (
    <div className="min-h-screen bg-carbon-500 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-circuit-500/10 border border-circuit-500/20 text-circuit-400 text-sm font-medium mb-6">
            <Printer className="w-4 h-4" />
            3D Printing Services
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            3D Printing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-circuit-400 to-circuit-300">
              Services
            </span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Custom 3D printed business cards and on-demand printing services.
            Multi-color, multi-material, precision manufactured.
          </p>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setTab("cards")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                tab === "cards"
                  ? "bg-circuit-500/20 border border-circuit-500/40 text-circuit-400"
                  : "bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:border-white/10"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Business Cards
            </button>
            <button
              onClick={() => setTab("print")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                tab === "print"
                  ? "bg-circuit-500/20 border border-circuit-500/40 text-circuit-400"
                  : "bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:border-white/10"
              }`}
            >
              <Upload className="w-4 h-4" /> Custom Print
            </button>
          </div>
        </motion.div>
      </section>

      {/* === CUSTOM PRINT TAB === */}
      {tab === "print" && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Upload Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Upload Your File</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Name *
                    </label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email *
                    </label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@acme.com"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors" />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <FileUp className="w-3.5 h-3.5" /> 3D File (STL, 3MF, OBJ) *
                  </label>
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    uploadFile ? "border-circuit-500/40 bg-circuit-500/5" : "border-white/[0.1] bg-white/[0.02] hover:border-white/20"
                  }`}>
                    <div className="flex flex-col items-center gap-2 text-center">
                      {uploadFile ? (
                        <>
                          <FileUp className="w-6 h-6 text-circuit-400" />
                          <span className="text-sm text-circuit-400 font-medium">{uploadFile.name}</span>
                          <span className="text-xs text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-500" />
                          <span className="text-sm text-gray-400">Click to upload or drag & drop</span>
                          <span className="text-xs text-gray-600">STL, 3MF, OBJ up to 50MB</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".stl,.3mf,.obj"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Material */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Material</label>
                  <div className="flex gap-3">
                    {["PLA", "PETG", "TPU"].map((mat) => (
                      <button key={mat} onClick={() => setPrintMaterial(mat)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                          printMaterial === mat
                            ? "bg-circuit-500/20 border-circuit-500/40 text-circuit-400"
                            : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/10"
                        }`}>
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Colors
                  </label>
                  <input value={printColors} onChange={(e) => setPrintColors(e.target.value)}
                    placeholder="e.g. Black base, white text, green accents"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors" />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5" /> Notes
                  </label>
                  <input value={printNotes} onChange={(e) => setPrintNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors" />
                </div>
              </div>
            </motion.div>

            {/* Right: Size Selection + Checkout */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Print Size</h2>
              <div className="space-y-3">
                {printSizes.map((s) => (
                  <button key={s.id} onClick={() => setPrintSize(s.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      printSize === s.id
                        ? "bg-circuit-500/10 border-circuit-500/40"
                        : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{s.label}</span>
                        <p className="text-sm text-gray-400 mt-0.5">{s.dim}</p>
                      </div>
                      <div className="text-2xl font-bold text-white">${s.price}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 glass-card p-5 space-y-2 text-sm">
                <h3 className="font-semibold text-white">What&apos;s included:</h3>
                <ul className="space-y-1.5 text-gray-400">
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-circuit-400" /> Bambu H2C multi-color printing</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-circuit-400" /> Up to 5 colors per print</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-circuit-400" /> Quality check before shipping</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-circuit-400" /> Ships in 3-5 business days</li>
                </ul>
              </div>

              <motion.button
                onClick={handleUploadCheckout}
                disabled={loading || !uploadFile || !form.name || !form.email}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-4 rounded-xl font-semibold text-lg bg-circuit-500 text-carbon-500 hover:bg-circuit-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {loading ? "Creating checkout..." : `Order Print — $${printSizes.find(s => s.id === printSize)?.price}`}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* === BUSINESS CARDS TAB === */}
      {tab === "cards" && <>
      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 text-center relative group"
            >
              <div className="text-5xl font-bold text-circuit-500/20 font-mono mb-2">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
              {i < 2 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-circuit-500/30 z-10" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Main Section: Config + Preview + Packs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Customize Your Card</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Company
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@acme.com"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="acme.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5" /> QR Code URL
                  </label>
                  <input
                    name="qr_url"
                    value={form.qr_url}
                    onChange={handleChange}
                    placeholder="https://acme.com/contact"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Tagline
                </label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="Building the future"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-circuit-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Accent Color</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAccent("green")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      accent === "green"
                        ? "bg-circuit-500/20 border-circuit-500/40 text-circuit-400"
                        : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/10"
                    }`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full bg-circuit-500 mr-2" />
                    Circuit Green
                  </button>
                  <button
                    onClick={() => setAccent("purple")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      accent === "purple"
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                        : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/10"
                    }`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2" />
                    Cyber Purple
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Live Preview</h2>

            {/* Card Preview */}
            <div className={`glass-card p-8 relative overflow-hidden border ${accentBorder}`}>
              {/* Accent stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  accent === "green"
                    ? "bg-gradient-to-r from-circuit-500 to-circuit-400"
                    : "bg-gradient-to-r from-purple-500 to-purple-400"
                }`}
              />

              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className={`text-xl font-bold ${form.name ? "text-white" : "text-gray-600"}`}>
                      {form.name || "Your Name"}
                    </h3>
                    {(form.company || form.tagline) && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {form.company && <span>{form.company}</span>}
                        {form.company && form.tagline && <span> &mdash; </span>}
                        {form.tagline && <span className="italic">{form.tagline}</span>}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    {form.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className={`w-3.5 h-3.5 ${accentColor}`} />
                        {form.email}
                      </div>
                    )}
                    {form.website && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Globe className={`w-3.5 h-3.5 ${accentColor}`} />
                        {form.website}
                      </div>
                    )}
                  </div>
                </div>

                {/* QR placeholder */}
                <div className={`w-16 h-16 rounded-lg ${accentBg} border ${accentBorder} flex items-center justify-center`}>
                  <QrCode className={`w-8 h-8 ${accentColor}`} />
                </div>
              </div>

              {/* Card footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Zap className="w-3 h-3" />
                  3D Printed by CircuitCoders
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  PLA + TPU
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-3 text-center">
              Actual card is 3D printed &mdash; this is a text preview of the layout
            </p>

            {/* Pack Selection */}
            <div className="mt-8 space-y-3">
              <h3 className="text-lg font-semibold">Choose Your Pack</h3>
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    selectedPack === pack.id
                      ? "bg-circuit-500/10 border-circuit-500/40"
                      : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{pack.name}</span>
                        {pack.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-circuit-500/20 text-circuit-400 border border-circuit-500/30">
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {pack.quantity} cards &mdash; {pack.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${pack.price}</div>
                      <div className="text-xs text-gray-500">
                        ${(pack.price / pack.quantity).toFixed(2)}/card
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Checkout Button */}
            <motion.button
              onClick={handleCheckout}
              disabled={loading || !form.name || !form.email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-4 rounded-xl font-semibold text-lg bg-circuit-500 text-carbon-500 hover:bg-circuit-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-circuit-400 to-circuit-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {loading ? "Creating checkout..." : `Order ${selectedPackData.quantity} Cards — $${selectedPackData.price}`}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      </>}

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Why 3D Printed Cards?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 group hover:border-circuit-500/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center mb-4 group-hover:border-circuit-500/40 transition-colors">
                <feature.icon className="w-6 h-6 text-circuit-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} CircuitCoders. All rights reserved.</p>
      </footer>
    </div>
  );
}
