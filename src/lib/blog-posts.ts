export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  category: string;
  author: string;
  heroTag: string;
  sections: {
    heading: string;
    paragraphs: string[];
    list?: { title?: string; items: string[] };
    callout?: string;
  }[];
  faqs?: { q: string; a: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "auto-detailing-website-design-north-county-san-diego",
    title:
      "Auto Detailing Website Design in North County San Diego — What Actually Works",
    description:
      "A 2026 playbook for auto detailers in Oceanside, Fallbrook, Vista and Carlsbad. What your site has to do, what to cut, and real local examples.",
    keywords: [
      "auto detailing website design",
      "North County San Diego",
      "Oceanside web designer",
      "Fallbrook web designer",
      "Vista web designer",
      "mobile detailing website",
      "detailing website examples",
    ],
    publishedAt: "2026-04-22",
    updatedAt: "2026-04-22",
    readTime: 7,
    category: "Local SEO",
    author: "Circuit Coders",
    heroTag: "LOCAL SEO · AUTO DETAILING",
    sections: [
      {
        heading: "North County detailers are losing work to their websites",
        paragraphs: [
          "If you detail cars in Oceanside, Vista, Carlsbad, Fallbrook or San Marcos, your biggest competitor isn't the shop two blocks over — it's the free Wix template your customers have to squint at on a phone.",
          "We've built and shipped auto detailing sites for clients across San Diego County. The pattern is identical every time: the owner is doing good work, getting solid referrals, and then losing 40–60% of inbound leads because the website loads slowly, has no visible phone number above the fold, or asks for ten fields before a quote.",
          "This post walks through what a detailing site actually has to do in 2026, what to cut, and how to stop paying for leads you are already getting but not converting.",
        ],
      },
      {
        heading: "The five things a North County detailing site has to do",
        paragraphs: [
          "Forget agency talk about 'brand experience.' A detailing site has one job: turn a phone-in-hand local searcher into a booked vehicle. Here are the five moves that actually drive revenue, ranked by impact.",
        ],
        list: {
          items: [
            "Phone number as a tap-to-call button, visible in the first 200 pixels. Most detailing leads are same-week. If they have to scroll, you lost them.",
            "Service area named explicitly — 'Mobile detailing serving Oceanside, Carlsbad, Vista, San Marcos and Fallbrook.' Google reads this. So do customers who are tired of contacting people who won't drive ten minutes.",
            "Price anchors on at least three packages. You don't need a full price list, but ranges ($150–$250 interior, etc.) let customers self-qualify and drastically cut tire-kicker calls.",
            "Before/after photos above testimonials. Not logos. Not stock photography of Porsches you've never touched — actual cars you've done, even if they're a 2012 Camry.",
            "A two-field quote form (name + phone) — nothing else. Every extra field kills conversions by 10–20%. You can ask the vehicle make on the call.",
          ],
        },
      },
      {
        heading: "What to cut",
        paragraphs: [
          "Most detailing sites we audit are drowning in features that lose leads. If your site does any of the following, it's actively hurting you.",
        ],
        list: {
          title: "Cut these today",
          items: [
            "Auto-playing hero video. It delays the 'tap to call' by two seconds. Two seconds is enough for 20% of mobile visitors to leave.",
            "A 'Book Now' scheduling widget that demands an email, vehicle VIN, and credit card hold. Nobody books a detail like they book a flight.",
            "Stock Google review widgets that crash on mobile Safari. Static testimonials load in 40ms and convert the same.",
            "A chatbot. For a detailing shop, a chatbot is a tax on real customers. Your phone number is the chatbot.",
            "Any hero copy that says 'transforming vehicles' or 'redefining the detailing experience.' Real customers want to know: what do you do, where do you do it, how much, how fast.",
          ],
        },
      },
      {
        heading: "Local SEO for North County detailers: the actual 2026 playbook",
        paragraphs: [
          "There are three layers to local SEO, and most detailers only know about one. All three matter.",
          "Layer one is your Google Business Profile (GBP). This is free, it's required, and it is the first thing a local searcher sees. Claim it, verify it, post photos weekly, respond to every review within 48 hours. GBP alone drives more detailing leads in North County than any paid channel.",
          "Layer two is on-page SEO. Your homepage title, h1, and meta description need to contain the keyword pattern '[service] + [city]' — e.g., 'Mobile auto detailing in Oceanside, CA.' Your footer should list the cities you serve. Every service page should have schema.org LocalBusiness markup.",
          "Layer three is citations — free listings on Yelp, Bing Places, Apple Maps, BBB, Thumbtack, and local chamber sites. These exist solely to create backlinks and consistent NAP (name/address/phone) data. Thirty minutes of setup, permanent compounding benefit.",
        ],
        callout:
          "A detailing shop doing layers one and two consistently will out-rank any Wix site in North County within 90 days, without paying for ads.",
      },
      {
        heading: "What a good detailing site costs",
        paragraphs: [
          "If a web agency quotes you $4,000 to build an auto detailing website, walk away. The market rate in 2026 for a clean, fast, local-SEO-optimized detailing site is $400–$900 one-time, with an optional $50/month for hosting and updates.",
          "Anything above that is buying you ego features you don't need. Anything below that is usually a template that every detailer in your zip code already has.",
          "Circuit Coders builds detailing sites at $499 flat with a 48-hour turnaround, no retainer. You see the demo first, then decide. No contract lock-in.",
        ],
      },
      {
        heading: "Real examples",
        paragraphs: [
          "If you want to see what a lean, conversion-first detailing site looks like in practice, we have live demo builds showcasing the approach. The 'Website Demos' section of circuitcoders.com shows six anonymized builds across auto detailing, mobile detailing, car wash, and related trades — all built under the same $499 / 48-hour model.",
          "The fastest way to know if we're the right fit: send us your current site and your three biggest complaints about it. We'll reply within 24 hours with a free audit and, if you want, a free mockup.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does an auto detailing website cost in San Diego?",
        a: "Market rate in North County San Diego is $400–$900 for a one-time build. Circuit Coders builds detailing sites at $499 flat with 48-hour turnaround.",
      },
      {
        q: "Do I need a separate website for mobile detailing vs. shop detailing?",
        a: "No. A single site with two clearly labeled service pages is better for SEO and easier for customers. Don't split your domain authority.",
      },
      {
        q: "How long does it take to rank on Google for 'auto detailing + city'?",
        a: "With a claimed Google Business Profile, consistent on-page SEO, and 15–20 citations, most detailers in North County see top-3 Maps rankings within 60–90 days.",
      },
    ],
  },
  {
    slug: "fallbrook-web-designer-499-flat-fee",
    title:
      "Fallbrook Web Designer: $499 Flat-Fee Sites for Local Businesses",
    description:
      "Fallbrook and North County web design at a flat $499 — what you get, what it costs elsewhere, and why flat-fee beats hourly for small businesses.",
    keywords: [
      "Fallbrook web designer",
      "Fallbrook web design",
      "flat fee website",
      "small business website",
      "North County web designer",
      "$499 website",
    ],
    publishedAt: "2026-04-22",
    updatedAt: "2026-04-22",
    readTime: 6,
    category: "Pricing",
    author: "Circuit Coders",
    heroTag: "PRICING · FALLBROOK",
    sections: [
      {
        heading: "Why flat-fee beats hourly for Fallbrook businesses",
        paragraphs: [
          "If you own a business in Fallbrook — a plumbing shop, a salon, a detailing outfit, a restaurant, a contractor — and you've been quoted $3,000+ for a website, you've been quoted the agency-hourly rate, not the Fallbrook rate.",
          "Agencies price on hours because that's how they cover their overhead: account managers, project managers, designers, developers, meetings. A small business in Fallbrook doesn't need any of that. You need a working site. Fast.",
          "Flat-fee pricing fixes the incentives. We quote $499. If the build takes us eight hours or eighteen, that's our problem, not yours. You know exactly what it costs before you say yes.",
        ],
      },
      {
        heading: "What $499 gets you",
        paragraphs: [
          "Every $499 flat-fee build from Circuit Coders includes:",
        ],
        list: {
          items: [
            "A custom-coded, mobile-first website (not Wix, not Squarespace, not a WordPress template).",
            "Up to 6 pages — typically Home, Services, About, Gallery, Contact, plus one optional.",
            "On-page SEO baked in: proper title tags, meta descriptions, schema.org LocalBusiness markup, alt text, sitemap.xml, robots.txt.",
            "Tap-to-call phone buttons on every page (the biggest conversion lever for trades).",
            "Google Business Profile setup help if you don't have one yet.",
            "One round of revisions after the first live preview.",
            "Deployed to Vercel with SSL, CDN, and auto-updates. Load time under one second.",
            "48-hour turnaround from signed brief to live preview.",
          ],
        },
      },
      {
        heading: "What it costs elsewhere",
        paragraphs: [
          "For context, here's what a small-business website actually costs in 2026 if you go elsewhere:",
        ],
        list: {
          items: [
            "Wix or Squarespace DIY: $16–$49/month forever, plus 10–40 hours of your time, plus a site that ranks worse than hand-coded sites.",
            "Fiverr: $75–$500 for a template swap, usually handed off with zero SEO and a design that another thousand businesses already use.",
            "Local freelancer: $800–$2,500 for a WordPress build. Good ones are worth it. Most aren't.",
            "Local agency: $3,000–$8,000 for a custom build, plus $150+/month retainer. Good for enterprise. Overkill for a Fallbrook plumber.",
            "National agency: $10,000+. You're paying for their office in New York.",
          ],
        },
      },
      {
        heading: "Who $499 is not for",
        paragraphs: [
          "Flat-fee works for small businesses that need a clean, fast, SEO-ready marketing site. It does not work for:",
        ],
        list: {
          items: [
            "E-commerce sites with hundreds of SKUs (different scope, quote separately).",
            "Booking platforms that need payment integration (add-on: $200–$500 depending on complexity).",
            "Multi-language sites (we do these, but not at this price).",
            "Businesses that want to change the design every week. We do one round of revisions, then ship.",
          ],
        },
      },
      {
        heading: "How to start",
        paragraphs: [
          "The entire flow: you send us your current site (if you have one) and your top three complaints about it. We build a free mockup within 48 hours. If you like it, you pay $499 and we ship it live within another 48 hours. If you don't, you walk away with zero cost.",
          "That's the offer. It's designed to make saying yes easy and saying no painless.",
        ],
        callout:
          "Local to Fallbrook? We also do in-person meetings. Call Leo at 442-297-8170 to grab coffee on Main Ave.",
      },
    ],
    faqs: [
      {
        q: "Is the $499 price for real, or is there a catch?",
        a: "The $499 is the total build price. There is no mandatory retainer, no hidden hosting fee, no contract lock-in. Optional hosting + monthly updates is $50/month if you want it.",
      },
      {
        q: "Do you work with clients outside of Fallbrook?",
        a: "Yes. We're based in Fallbrook and work across North County San Diego and remotely with clients anywhere in the US. Local clients get the option of in-person meetings.",
      },
      {
        q: "How long until my site ranks on Google?",
        a: "With on-page SEO done correctly, a claimed Google Business Profile, and 15+ citations, most local-service sites see top-5 rankings for their primary '[service] + [city]' keyword within 60–90 days.",
      },
    ],
  },
  {
    slug: "why-wix-hurts-your-google-rankings",
    title:
      "Why Wix Hurts Your Google Rankings (And What To Build Instead)",
    description:
      "Wix looks cheap up-front but costs you Google rankings, page speed, and conversions. Here's the data, and what to build instead for small businesses.",
    keywords: [
      "Wix SEO problems",
      "Wix vs custom website",
      "why Wix is bad for SEO",
      "Wix page speed",
      "small business website alternatives",
      "Wix alternatives",
    ],
    publishedAt: "2026-04-22",
    updatedAt: "2026-04-22",
    readTime: 8,
    category: "SEO",
    author: "Circuit Coders",
    heroTag: "SEO · PLATFORM COMPARISON",
    sections: [
      {
        heading: "The Wix trap",
        paragraphs: [
          "Wix is the default platform for small-business owners who need a site and don't know where to start. It's cheap, it's familiar, and it promises 'you can build a website in minutes.'",
          "The problem isn't that Wix is bad at building websites. The problem is that Wix is actively bad at ranking websites — and for a small business, the difference between a site nobody finds and a site Google ships you leads is the whole game.",
          "We've audited dozens of Wix sites for Fallbrook, Oceanside, and Vista businesses. The failure mode is always the same: beautiful site, zero organic traffic.",
        ],
      },
      {
        heading: "What Wix does wrong at the technical level",
        paragraphs: [
          "Google's ranking algorithm rewards fast, clean, semantically-correct HTML. Wix produces the opposite. Here's the short list of what's actually happening under the hood:",
        ],
        list: {
          items: [
            "Page weight. A Wix home page averages 3–5 MB on first load. A hand-coded Next.js page with the same content loads in under 400 KB. Google's Core Web Vitals penalize anything over 2.5 seconds on mobile, and Wix routinely fails that.",
            "JavaScript bloat. Wix sites ship the full Wix runtime on every page — even if your page has three images and a headline. That's hundreds of KB of code Google has to parse before it can even read your content.",
            "Render-blocking. Wix renders most content client-side, meaning Google's crawler has to execute JavaScript before it sees your page. That delays indexing and reduces ranking signals.",
            "Bad semantic HTML. Wix wraps everything in generic divs with auto-generated class names. Google rewards proper h1/h2/h3 hierarchy, semantic section/article tags, and clean heading trees — Wix produces none of that.",
            "URL structure. Wix defaults to URLs like yoursite.com/post/123456. Clean URLs (yoursite.com/mobile-detailing-oceanside) outrank messy ones for the exact same content.",
          ],
        },
      },
      {
        heading: "What Wix does wrong at the SEO level",
        paragraphs: [
          "Even if you pay for Wix's SEO add-ons, you're fighting the platform. The limits are structural.",
        ],
        list: {
          items: [
            "Limited schema markup. Google reads schema.org JSON-LD to understand what a business does, where, and for whom. Wix auto-generates minimal schema and won't let you customize it for local service areas.",
            "Slow time-to-first-byte. Wix servers route through their CDN, which is geographically distant from most San Diego County users. You're routinely seeing 300–600ms TTFB when a Vercel-hosted site would give you 40ms.",
            "Template duplication. Every Wix template is used by thousands of sites. Google deprioritizes near-duplicate page structures, which is why 'why my Wix site doesn't rank' is one of the most common questions on SEO forums.",
            "No control over the head tag. Canonical tags, OpenGraph, proper title hierarchy — all locked behind the Wix abstraction. You get what Wix gives you.",
          ],
        },
      },
      {
        heading: "What to build instead",
        paragraphs: [
          "If you own a local business, you have three reasonable options:",
        ],
        list: {
          items: [
            "Hire someone to build a hand-coded site on Next.js + Vercel. Fast, SEO-clean, inexpensive to host, owned forever. This is what Circuit Coders builds at $499 flat.",
            "Use a static-site generator like Astro or 11ty if you (or a friend) are technical. Same performance profile, more DIY.",
            "Use WordPress with a lightweight theme (GeneratePress, Kadence) and a good host (Cloudways, Kinsta). More moving parts, but better than Wix for SEO if configured correctly.",
          ],
          title: "Reasonable options",
        },
      },
      {
        heading: "The migration question",
        paragraphs: [
          "If you're on Wix now, the most common question is 'how hard is it to move?' Answer: not hard, and it's usually free if you have under 20 pages.",
          "A migration involves copying your content, rebuilding the pages on a faster platform, setting up 301 redirects from the old Wix URLs to the new ones (so you don't lose any ranking you already have), and re-pointing your domain. A good developer can do this in two to five days.",
          "The ranking benefit is usually visible within 30 days. We've seen detailers, salons, and trades businesses in North County double their organic traffic within 60 days of migrating off Wix, without any additional content or link-building effort.",
        ],
        callout:
          "If you're on Wix and curious what's possible, send us your URL. We'll run a free audit and show you exactly what's hurting your rankings.",
      },
      {
        heading: "The honest case for Wix",
        paragraphs: [
          "To be fair: Wix is fine for a portfolio site, a personal blog, or a hobby project where ranking on Google doesn't matter. It's also fine as a temporary solution while you figure out your business.",
          "But for a business that depends on local search traffic — a detailer, a plumber, a salon, a restaurant, a contractor — Wix is a handicap. You are paying a monthly fee to be invisible.",
        ],
      },
    ],
    faqs: [
      {
        q: "I have a Wix site that ranks on Google. Does this still apply?",
        a: "If you rank, you rank — don't fix what isn't broken. But audit your Core Web Vitals on PageSpeed Insights. If you score below 60 on mobile, you're leaving rankings on the table.",
      },
      {
        q: "Will I lose my Google rankings if I migrate off Wix?",
        a: "Only if the migration is done poorly. With proper 301 redirects from old URLs to new ones, rankings typically hold or improve within 30 days.",
      },
      {
        q: "Is Squarespace better than Wix for SEO?",
        a: "Marginally. Squarespace produces cleaner HTML and loads slightly faster, but you still hit the same structural limits on schema, URLs, and performance. Custom-coded still wins.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
