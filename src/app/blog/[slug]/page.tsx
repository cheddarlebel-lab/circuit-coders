import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Calendar } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CircuitBackground from "@/components/CircuitBackground";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found — Circuit Coders" };

  const url = `https://circuitcoders.com/blog/${post.slug}`;
  return {
    title: `${post.title} | Circuit Coders`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author, url: "https://circuitcoders.com" },
    publisher: {
      "@type": "Organization",
      name: "Circuit Coders",
      logo: { "@type": "ImageObject", url: "https://circuitcoders.com/brand/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://circuitcoders.com/blog/${post.slug}` },
    keywords: post.keywords.join(", "),
  };

  const faqJsonLd = post.faqs && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <CircuitBackground />
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-mono text-circuit-300 hover:text-circuit-200 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

        <header className="mb-12">
          <div className="text-xs font-mono text-circuit-300/90 tracking-widest uppercase mb-5">
            {post.heroTag}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed mb-6">
            {post.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-white/20">/</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {post.readTime} min read
            </span>
            <span className="text-white/20">/</span>
            <span>By {post.author}</span>
          </div>
        </header>

        <article className="prose-article space-y-12">
          {post.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-5">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="text-base md:text-lg text-gray-100 leading-[1.8] mb-5"
                >
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-3 my-6 pl-0">
                  {section.list.items.map((item, k) => (
                    <li
                      key={k}
                      className="relative pl-7 text-base text-gray-100 leading-[1.75] before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-3 before:h-[2px] before:bg-circuit-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.callout && (
                <div className="my-8 rounded-xl border-l-2 border-circuit-400 bg-circuit-500/[0.04] px-6 py-5 text-base md:text-lg text-gray-100 italic leading-relaxed">
                  {section.callout}
                </div>
              )}
            </section>
          ))}
        </article>

        {post.faqs && (
          <section className="mt-16 pt-12 border-t border-white/[0.06]">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Frequently asked
            </h2>
            <div className="space-y-6">
              {post.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 rounded-2xl border border-circuit-500/20 bg-circuit-500/[0.03] p-8 md:p-10 text-center">
          <div className="text-xs font-mono text-circuit-300 tracking-widest uppercase mb-3">
            $499 FLAT · 48-HOUR TURNAROUND
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to see what a real site looks like?
          </h3>
          <p className="text-gray-200 max-w-xl mx-auto mb-6">
            Send us your URL. We&apos;ll build you a free mockup within 48 hours. If you like it, you pay $499 and we ship. If not, walk away — no cost.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full bg-circuit-500 hover:bg-circuit-400 text-carbon-500 font-semibold px-8 py-3 transition-colors"
          >
            Request a free mockup
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
