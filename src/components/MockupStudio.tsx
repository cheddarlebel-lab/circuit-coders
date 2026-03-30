"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Radio, Monitor, Compass, Cog, Battery, Server, CircuitBoard,
  ArrowRight, RotateCcw, Sparkles, Wifi, Database, Cloud, Smartphone,
} from "lucide-react";
import { hardwareComponents } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Cpu, Radio, Monitor, Compass, Cog, Battery, Server, CircuitBoard,
};

type MockupType = "schematic" | "dashboard" | "api";

const projectTemplates = [
  { id: "iot-sensor", name: "IoT Sensor Array", components: ["esp32", "imu-sensor", "lora-module", "lipo-battery"], type: "schematic" as MockupType },
  { id: "smart-display", name: "Smart Display Hub", components: ["rpi5", "oled-display", "custom-pcb"], type: "dashboard" as MockupType },
  { id: "motor-ctrl", name: "Motor Controller", components: ["esp32", "servo-motor", "custom-pcb", "lipo-battery"], type: "schematic" as MockupType },
  { id: "gateway", name: "LoRa Gateway", components: ["rpi5", "lora-module", "custom-pcb"], type: "api" as MockupType },
];

export default function MockupStudio() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [mockupType, setMockupType] = useState<MockupType>("schematic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const toggleComponent = useCallback((id: string) => {
    setSelectedComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setShowPreview(false);
  }, []);

  const loadTemplate = useCallback((template: typeof projectTemplates[0]) => {
    setSelectedComponents(template.components);
    setMockupType(template.type);
    setShowPreview(false);
  }, []);

  const generateMockup = useCallback(() => {
    if (selectedComponents.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  }, [selectedComponents]);

  const selectedData = hardwareComponents.filter((c) =>
    selectedComponents.includes(c.id)
  );

  return (
    <section id="mockup" className="relative py-32 px-4">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-circuit-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card text-xs font-mono text-circuit-400 mb-6">
            <Sparkles className="w-3 h-3" />
            INTERACTIVE PREVIEW
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-subtle">Instant Mockup</span>{" "}
            <span className="text-gradient">Studio</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Select your hardware components and see a generated preview of your
            project — schematic, dashboard, or API architecture — before you
            commit.
          </p>
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <span className="text-sm text-gray-500 self-center mr-2">Quick start:</span>
          {projectTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              className="px-4 py-2 text-sm glass-card hover:border-circuit-500/30 hover:text-circuit-400 text-gray-400 transition-all duration-300"
            >
              {t.name}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Component picker (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Components</h3>
              {selectedComponents.length > 0 && (
                <button
                  onClick={() => { setSelectedComponents([]); setShowPreview(false); }}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {hardwareComponents.map((comp) => {
                const Icon = iconMap[comp.icon] || Cpu;
                const selected = selectedComponents.includes(comp.id);
                return (
                  <motion.button
                    key={comp.id}
                    onClick={() => toggleComponent(comp.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                      selected
                        ? "bg-circuit-500/10 border-circuit-500/40 shadow-[0_0_20px_rgba(0,230,138,0.1)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${selected ? "text-circuit-400" : "text-gray-500"}`} />
                      <span className={`text-sm font-medium ${selected ? "text-circuit-300" : "text-gray-300"}`}>
                        {comp.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{comp.model}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Mockup type selector */}
            <div className="glass-card p-4 mt-4">
              <div className="text-sm text-gray-400 mb-3">Preview Type</div>
              <div className="flex gap-2">
                {(["schematic", "dashboard", "api"] as MockupType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setMockupType(type); setShowPreview(false); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${
                      mockupType === type
                        ? "bg-circuit-500/20 text-circuit-400 border border-circuit-500/30"
                        : "text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <motion.button
              onClick={generateMockup}
              disabled={selectedComponents.length === 0 || isGenerating}
              whileHover={{ scale: selectedComponents.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedComponents.length === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-circuit-500 text-carbon-500 hover:bg-circuit-400 hover:shadow-[0_0_40px_rgba(0,230,138,0.3)]"
              }`}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-carbon-500/30 border-t-carbon-500 rounded-full"
                  />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Mockup
                  {selectedComponents.length > 0 && (
                    <span className="ml-2 text-xs opacity-70">
                      ({selectedComponents.length} components)
                    </span>
                  )}
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Right — Preview (3 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="glass-card overflow-hidden min-h-[600px]">
              {/* Preview header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    project-preview.{mockupType === "api" ? "json" : mockupType === "dashboard" ? "tsx" : "svg"}
                  </span>
                </div>
                {showPreview && (
                  <span className="text-xs font-mono text-circuit-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-circuit-500 animate-pulse" />
                    LIVE PREVIEW
                  </span>
                )}
              </div>

              {/* Preview body */}
              <div className="p-6 min-h-[520px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {!showPreview && !isGenerating && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Select components and click Generate
                      </p>
                    </motion.div>
                  )}

                  {isGenerating && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4 border-2 border-circuit-500/20 border-t-circuit-500 rounded-full"
                      />
                      <p className="text-circuit-400 font-mono text-sm">Generating {mockupType} preview...</p>
                    </motion.div>
                  )}

                  {showPreview && mockupType === "schematic" && (
                    <SchematicPreview components={selectedData} />
                  )}
                  {showPreview && mockupType === "dashboard" && (
                    <DashboardPreview components={selectedData} />
                  )}
                  {showPreview && mockupType === "api" && (
                    <APIPreview components={selectedData} />
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {selectedComponents.length > 0 && (
                <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="text-white font-semibold">{selectedComponents.length}</span> components selected
                  </div>
                  <a
                    href="#contact"
                    className="px-4 py-2 text-sm bg-circuit-500/10 text-circuit-400 rounded-lg border border-circuit-500/20 hover:bg-circuit-500/20 transition-colors flex items-center gap-1"
                  >
                    Start a Project <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Schematic Preview ─── */
function SchematicPreview({ components }: { components: typeof hardwareComponents }) {
  const positions = components.map((_, i) => ({
    x: 80 + (i % 3) * 200,
    y: 80 + Math.floor(i / 3) * 180,
  }));

  return (
    <motion.div
      key="schematic"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full"
    >
      <svg viewBox="0 0 700 450" className="w-full h-auto">
        {/* Connection lines */}
        {positions.length > 1 &&
          positions.slice(1).map((pos, i) => (
            <motion.line
              key={`line-${i}`}
              x1={positions[i].x + 60}
              y1={positions[i].y + 40}
              x2={pos.x + 60}
              y2={pos.y + 40}
              stroke="rgba(0,230,138,0.3)"
              strokeWidth="2"
              strokeDasharray="6 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
            />
          ))}

        {/* Animated data pulses along lines */}
        {positions.length > 1 &&
          positions.slice(1).map((pos, i) => (
            <motion.circle
              key={`pulse-${i}`}
              r="4"
              fill="#00e68a"
              initial={{ opacity: 0 }}
              animate={{
                cx: [positions[i].x + 60, pos.x + 60],
                cy: [positions[i].y + 40, pos.y + 40],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ delay: 1.5 + i * 0.3, duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          ))}

        {/* Component blocks */}
        {components.map((comp, i) => {
          const pos = positions[i];
          return (
            <motion.g
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width="120"
                height="80"
                rx="8"
                fill="rgba(0,230,138,0.05)"
                stroke="rgba(0,230,138,0.3)"
                strokeWidth="1"
              />
              {/* Pin dots */}
              <circle cx={pos.x} cy={pos.y + 25} r="3" fill="#00e68a" opacity="0.6" />
              <circle cx={pos.x} cy={pos.y + 55} r="3" fill="#00e68a" opacity="0.6" />
              <circle cx={pos.x + 120} cy={pos.y + 25} r="3" fill="#00e68a" opacity="0.6" />
              <circle cx={pos.x + 120} cy={pos.y + 55} r="3" fill="#00e68a" opacity="0.6" />

              <text x={pos.x + 60} y={pos.y + 35} textAnchor="middle" fill="#00e68a" fontSize="11" fontFamily="monospace" fontWeight="600">
                {comp.name}
              </text>
              <text x={pos.x + 60} y={pos.y + 55} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">
                {comp.model}
              </text>
            </motion.g>
          );
        })}

        {/* Title */}
        <text x="350" y="430" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">
          CIRCUIT CODERS — PROJECT SCHEMATIC v1.0
        </text>
      </svg>
    </motion.div>
  );
}

/* ─── Dashboard Preview ─── */
function DashboardPreview({ components }: { components: typeof hardwareComponents }) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full space-y-4"
    >
      {/* Dashboard header */}
      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-circuit-500/20 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-circuit-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Device Dashboard</div>
            <div className="text-xs text-gray-500 font-mono">{components.length} nodes online</div>
          </div>
        </div>
        <span className="text-xs font-mono text-circuit-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-circuit-500 animate-pulse" /> Live
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Uptime", value: "99.8%", icon: Wifi, color: "text-green-400" },
          { label: "Latency", value: "12ms", icon: Database, color: "text-blue-400" },
          { label: "Throughput", value: "2.4k/s", icon: Cloud, color: "text-purple-400" },
        ].map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]"
          >
            <metric.icon className={`w-4 h-4 ${metric.color} mb-2`} />
            <div className="text-lg font-bold text-white font-mono">{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Device list */}
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/[0.06] text-xs font-mono text-gray-500">
          CONNECTED DEVICES
        </div>
        {components.map((comp, i) => {
          const Icon = iconMap[comp.icon] || Cpu;
          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-circuit-400" />
                <div>
                  <span className="text-sm text-white">{comp.name}</span>
                  <span className="text-xs text-gray-500 ml-2 font-mono">{comp.model}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-500 font-mono">Active</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="text-xs text-gray-500 mb-3 font-mono">TELEMETRY — LAST 24H</div>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${20 + Math.random() * 80}%` }}
              transition={{ delay: 1 + i * 0.03, duration: 0.5 }}
              className="flex-1 bg-circuit-500/20 rounded-t border-t border-circuit-500/40"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── API Preview ─── */
function APIPreview({ components }: { components: typeof hardwareComponents }) {
  const endpoints = components.map((c) => ({
    method: "GET",
    path: `/api/v1/devices/${c.id}/telemetry`,
    description: `Real-time data from ${c.name}`,
  }));

  endpoints.push(
    { method: "POST", path: "/api/v1/devices/command", description: "Send command to device" },
    { method: "WS", path: "/ws/v1/stream", description: "WebSocket telemetry stream" }
  );

  return (
    <motion.div
      key="api"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full space-y-4 font-mono text-sm"
    >
      {/* API header */}
      <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <Cloud className="w-5 h-5 text-circuit-400" />
        <div>
          <div className="text-white font-semibold">Circuit Coders API</div>
          <div className="text-xs text-gray-500">v1.0 — OpenAPI 3.0 | Base: https://api.circuitcoders.com</div>
        </div>
      </div>

      {/* Auth */}
      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="text-xs text-gray-500 mb-2">AUTHENTICATION</div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded">Bearer</span>
          <code className="text-gray-400">Authorization: Bearer cc_live_***************</code>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-2">
        {endpoints.map((ep, i) => {
          const methodColors: Record<string, string> = {
            GET: "bg-green-500/10 text-green-400",
            POST: "bg-blue-500/10 text-blue-400",
            WS: "bg-purple-500/10 text-purple-400",
          };
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] hover:border-white/10 transition-colors"
            >
              <span className={`px-2 py-1 text-xs rounded font-bold ${methodColors[ep.method]}`}>
                {ep.method}
              </span>
              <code className="text-circuit-300 flex-1">{ep.path}</code>
              <span className="text-xs text-gray-500 hidden sm:block">{ep.description}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Example response */}
      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="text-xs text-gray-500 mb-2">EXAMPLE RESPONSE</div>
        <pre className="text-xs text-gray-400 overflow-x-auto">
{`{
  "device_id": "${components[0]?.id || "esp32"}",
  "timestamp": "${new Date().toISOString()}",
  "telemetry": {
    "temperature": 24.5,
    "humidity": 62.1,
    "battery_pct": 87,
    "rssi": -42
  },
  "status": "online",
  "firmware": "2.4.1"
}`}
        </pre>
      </div>

      {/* SDK */}
      <div className="flex items-center gap-3 p-3 bg-circuit-500/5 rounded-xl border border-circuit-500/20">
        <Smartphone className="w-4 h-4 text-circuit-400" />
        <span className="text-xs text-circuit-400">SDKs available: Python, Node.js, Go, Rust</span>
      </div>
    </motion.div>
  );
}
