import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CircuitBackground from "@/components/CircuitBackground";

export const metadata: Metadata = {
  title: "Blog — Circuit Coders | Local SEO + Web Design for Small Businesses",
  description:
    "Field notes on local SEO, web design, and custom hardware for small businesses in Fallbrook, Oceanside, and North County San Diego.",
  alternates: { canonical: "https://circuitcoders.com/blog" },
  openGraph: {
    title: "Circuit Coders Blog — Local SEO + Web Design",
    description:
      "Field notes on local SEO, web design, and custom hardware for small businesses in North County San Diego.",
    url: "https://circuitcoders.com/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  const sorted = [...blogPosts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  return (
    <div>
      <CircuitBackground />
      <Navbar />
      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">
        <header className="mb-16">
          <div className="text-xs font-mono text-circuit-300/90 tracking-widest uppercase mb-5">
            FIELD NOTES · LOCAL SEO · WEB DESIGN
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Notes from building <span className="text-circuit-400">small-business websites</span> that actually rank.
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl leading-relaxed">
            We build sites for Fallbrook, Oceanside, and North County businesses — and write about what works. No fluff, no agency-speak.
          </p>
        </header>

        <div className="grid gap-6">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-circuit-500/30 p-8 transition-all"
            >
              <div className="flex items-center gap-4 mb-4 text-xs font-mono text-circuit-300/80 tracking-widest uppercase">
                <span>{post.category}</span>
                <span className="text-white/20">/</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.readTime} min read
                </span>
                <span className="text-white/20">/</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-circuit-300 transition-colors mb-3 leading-tight">
                {post.title}
              </h2>
              <p className="text-base text-gray-200 leading-relaxed mb-4">
                {post.description}
              </p>
              <div className="inline-flex items-center gap-1.5 text-sm font-mono text-circuit-400 group-hover:gap-3 transition-all">
                Read the post
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 rounded-2xl border border-circuit-500/20 bg-circuit-500/[0.03] p-10 text-center">
          <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-4">
            FREE AUDIT · NO COMMITMENT
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Want us to audit your current site?
          </h3>
          <p className="text-gray-200 max-w-xl mx-auto mb-6">
            Send us your URL. We&apos;ll reply within 24 hours with a free audit — what&apos;s hurting your rankings, and how to fix it.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full bg-circuit-500 hover:bg-circuit-400 text-carbon-500 font-semibold px-8 py-3 transition-colors"
          >
            Request a free audit
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
