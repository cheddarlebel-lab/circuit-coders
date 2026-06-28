import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import ChatAgent from "@/components/ChatAgent";
import { faqJsonLd } from "@/lib/faq";

const SITE_URL = "https://circuitcoders.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Circuit Coders — Websites, Local SEO, AI Receptionists & Custom Software",
    template: "%s | Circuit Coders",
  },
  description:
    "North County San Diego engineering studio. Custom websites from $1,500, Google Maps / local SEO, 24/7 AI phone receptionists, apps, and custom software — designed and built by one team.",
  keywords: [
    "San Diego web designer",
    "San Diego web design",
    "Oceanside web designer",
    "North County San Diego web design",
    "small business website",
    "local SEO San Diego",
    "Google Business Profile management",
    "AI receptionist",
    "AI phone answering service",
    "auto detailing website design",
    "barber shop website",
    "custom software development",
    "mobile app development",
    "custom PCB",
    "firmware development",
    "full-stack development",
  ],
  authors: [{ name: "Circuit Coders" }],
  creator: "Circuit Coders",
  publisher: "Circuit Coders",
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Circuit Coders",
    title:
      "Circuit Coders — Websites, Local SEO, AI Receptionists & Custom Software",
    description:
      "Custom websites from $1,500, Google Maps / local SEO, 24/7 AI phone receptionists, apps, and custom software — built by one team in North County San Diego.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Circuit Coders — Websites, Local SEO, AI & Custom Software",
    description:
      "Custom websites from $1,500, local SEO, 24/7 AI receptionists, apps, and custom software — designed and built by one team.",
  },
  verification: {
    // Add these once verified in Search Console + Bing Webmaster.
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}#organization`,
  name: "Circuit Coders",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  description:
    "Engineering studio building business websites, local SEO, AI phone receptionists, mobile apps, custom software, and hardware. Based in North County San Diego, CA.",
  founder: { "@type": "Person", name: "Leo Lebel" },
  sameAs: [
    "https://instagram.com/circuit_coders",
    "https://x.com/Cheddarlebel",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-442-297-8170",
    contactType: "sales",
    email: "admin@circuitcoders.com",
    areaServed: "US",
    availableLanguage: ["English"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}#localbusiness`,
  name: "Circuit Coders",
  url: SITE_URL,
  telephone: "+1-442-297-8170",
  email: "admin@circuitcoders.com",
  image: `${SITE_URL}/brand/logo.png`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Diego",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "San Diego" },
    { "@type": "City", name: "Oceanside" },
    { "@type": "City", name: "Vista" },
    { "@type": "City", name: "Carlsbad" },
    { "@type": "City", name: "San Marcos" },
    { "@type": "City", name: "Escondido" },
    { "@type": "AdministrativeArea", name: "San Diego County" },
  ],
  serviceType: [
    "Web Design",
    "Web Development",
    "Local SEO",
    "Google Business Profile Management",
    "AI Phone Receptionist",
    "Mobile App Development",
    "Custom Software Development",
    "Custom Hardware Engineering",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Custom Business Website",
      price: "1500",
      priceCurrency: "USD",
      description:
        "Custom-coded business website with on-page SEO, mobile-first design, CMS, and lead capture. Built from scratch — no templates.",
    },
    {
      "@type": "Offer",
      name: "Local SEO + Google Maps Management",
      price: "149",
      priceCurrency: "USD",
      description:
        "Google Business Profile build-out and ongoing local SEO so you show up in the map pack. $199 one-time setup, then $149/mo.",
    },
    {
      "@type": "Offer",
      name: "AI Phone Receptionist",
      priceCurrency: "USD",
      description:
        "A bilingual AI voice agent that answers calls 24/7, books and qualifies jobs, and texts you every lead.",
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: "Circuit Coders",
  publisher: { "@id": `${SITE_URL}#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="bg-carbon-500 text-white antialiased font-sans">
        {children}
        <ChatAgent />
        <Analytics />
      </body>
    </html>
  );
}
