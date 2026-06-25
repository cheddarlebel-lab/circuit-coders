// Shared FAQ data — rendered visibly by FAQ.tsx AND emitted as FAQPage JSON-LD
// in layout.tsx. Google requires the schema to match on-page content, so both
// must read from here. Questions target real buyer + local-SEO queries.

export type FaqItem = { q: string; a: string };

export const FAQS: FaqItem[] = [
  {
    q: "How much does a website cost?",
    a: "Custom websites are fixed-price: $1,500 (Starter, up to 5 pages), $2,500 (Pro, with a CMS and Stripe), or $4,500+ (Scale, a full app with accounts, database, and admin). You see a live preview before you pay a dollar, and the price is quoted up front — no hourly billing.",
  },
  {
    q: "Do you do SEO and Google Maps?",
    a: "Yes. Our Local SEO + Google Maps service gets you showing up when customers search “[your trade] near me” — a full Google Business Profile build-out, local schema, posts, and a review flow. It's $199 to set up plus $149/mo, with the first month free.",
  },
  {
    q: "What is the AI receptionist, and can I try it?",
    a: "It's a bilingual (English/Spanish) AI voice agent that answers every call 24/7, books appointments, qualifies leads, and texts you the details — so you never lose a job to voicemail. You can call our live demo line and talk to it yourself: (760) 546-9189.",
  },
  {
    q: "How long does a project take?",
    a: "Most websites launch in 5–14 days depending on tier — Starter in about 5–7 days, Pro in 7–10, and full app builds in 10–14. Local SEO, the AI receptionist, and ongoing services go live within a few days of kickoff.",
  },
  {
    q: "Do you build mobile apps and custom software?",
    a: "Yes — native iOS and Android apps built and shipped to the App Store and Google Play, plus full-stack web apps and SaaS with authentication, dashboards, and Stripe billing. Custom builds are quoted per project.",
  },
  {
    q: "Where are you located, and who do you work with?",
    a: "Circuit Coders is based in North County San Diego (Fallbrook, Oceanside, Vista, Carlsbad, San Marcos, Escondido) and works with local service businesses — contractors, auto and collision shops, detailers, barbers, and more — as well as clients nationwide.",
  },
  {
    q: "Are these real custom sites or templates?",
    a: "Every site is custom-built from scratch — not Wix, not Squarespace, not a theme. You get an admin dashboard to manage your own content, and you own the result. We design each build around your brand and the way your customers actually buy.",
  },
  {
    q: "What does it cost to maintain a site after launch?",
    a: "Optional. A $199/mo maintenance retainer covers hosting, security updates, backups, and a couple hours of content or layout edits each month. There's no lock-in — you can also take the site and run it yourself.",
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
