import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Circuit Coders — Links",
  description:
    "Websites, local SEO, and AI phone receptionists for San Diego businesses. Get a free preview before you pay.",
  alternates: { canonical: "https://circuitcoders.com/links" },
  robots: { index: false, follow: true },
};

const links = [
  {
    label: "Get my free website preview",
    sub: "We build it before you pay — see it first",
    href: "https://circuitcoders.com/#contact",
    primary: true,
  },
  {
    label: "📞 Hear our AI receptionist — live",
    sub: "Call the demo line: (760) 546-9189",
    href: "tel:+17605469189",
  },
  {
    label: "See our work",
    sub: "Real sites we've built for local shops",
    href: "https://circuitcoders.com/#work",
  },
  {
    label: "Visit circuitcoders.com",
    sub: "Websites · Local SEO · AI · Apps · Software",
    href: "https://circuitcoders.com",
  },
];

export default function LinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-carbon-500 text-white">
      {/* static glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-circuit-500/[0.10] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,6,26,0.6)_70%,rgba(6,6,26,0.95)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-14">
        {/* profile */}
        <Image
          src="/brand/cc-pfp-1080.png"
          alt="Circuit Coders"
          width={104}
          height={104}
          priority
          className="rounded-2xl ring-1 ring-white/10 shadow-lg shadow-circuit-500/10"
        />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Circuit Coders</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-300">
          Websites · Local SEO · AI Receptionists
          <br />
          <span className="text-gray-400">Built for San Diego businesses 📍</span>
        </p>

        {/* links */}
        <div className="mt-9 flex w-full flex-col gap-3.5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={
                "group rounded-2xl border px-5 py-4 transition-all active:scale-[0.98] " +
                (l.primary
                  ? "border-circuit-400/60 bg-circuit-500/15 hover:bg-circuit-500/25"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]")
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold leading-tight">{l.label}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{l.sub}</div>
                </div>
                <span
                  className={
                    "text-lg transition-transform group-hover:translate-x-0.5 " +
                    (l.primary ? "text-circuit-300" : "text-gray-500")
                  }
                >
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

        <a
          href="https://instagram.com/circuitcoders"
          className="mt-9 text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          @circuitcoders
        </a>
        <p className="mt-auto pt-8 text-[11px] text-gray-600">
          San Diego, CA · custom-coded, never templates
        </p>
      </div>
    </main>
  );
}
