"use client";

import { motion } from "framer-motion";
import { Zap, Github, Twitter, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] py-20 px-4">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-circuit-500/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-5 gap-10 mb-16">
          {/* Brand — 2 cols */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-circuit-500/10 border border-circuit-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-circuit-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">
                  Circuit<span className="text-circuit-400">Coders</span>
                </span>
                <div className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                  Engineering Studio
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
              Engineering studio building bespoke hardware and
              software solutions. From custom PCBs to full-stack SaaS
              platforms — designed, built, and shipped.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "Twitter" },
                { icon: Mail, label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="group w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-circuit-400 hover:border-circuit-500/20 hover:bg-circuit-500/5 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Services",
              links: [
                { label: "Hardware Design", href: "/#services" },
                { label: "Firmware Engineering", href: "/#services" },
                { label: "Software Integration", href: "/#services" },
                { label: "IoT Platforms", href: "/#services" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Portfolio", href: "/#portfolio" },
                { label: "Mockup Studio", href: "/#mockup" },
                { label: "Our Process", href: "/#process" },
                { label: "Metrics", href: "/#metrics" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "Contact", href: "/#contact" },
                { label: "Start a Project", href: "/#contact" },
                { label: "Admin Portal", href: "/admin" },
                { label: "Client Portal", href: "/portal" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="group text-sm text-gray-500 hover:text-circuit-400 transition-colors flex items-center gap-1">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-600 font-mono">
            &copy; {new Date().getFullYear()} Circuit Coders. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <span>Built with</span>
            <Zap className="w-3 h-3 text-circuit-500" />
            <span>by Circuit Coders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
