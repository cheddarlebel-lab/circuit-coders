import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE_URL = "https://circuitcoders.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Circuit Coders — Fallbrook Web Designer + Custom Hardware | $499 Flat Sites",
    template: "%s | Circuit Coders",
  },
  description:
    "Fallbrook-based engineering studio. Custom-coded small business websites from $499 with 48-hour turnaround. Plus custom hardware, firmware, and IoT platforms.",
  keywords: [
    "Fallbrook web designer",
    "Oceanside web designer",
    "North County San Diego web design",
    "small business website",
    "auto detailing website design",
    "barber shop website",
    "flat fee website",
    "$499 website",
    "custom PCB",
    "firmware development",
    "IoT platform",
    "hardware engineering",
    "embedded systems",
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
      "Circuit Coders — Fallbrook Web Designer + Custom Hardware | $499 Flat Sites",
    description:
      "Custom-coded small business websites from $499 with 48-hour turnaround. Plus custom hardware, firmware, and IoT platforms.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Circuit Coders — Web Design + Custom Hardware",
    description:
      "Custom-coded small business websites from $499 with 48-hour turnaround. Plus custom hardware, firmware, and IoT platforms.",
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
    "Engineering studio building small business websites, custom hardware, firmware, and IoT platforms. Based in Fallbrook, CA.",
  founder: { "@type": "Person", name: "Leo Lebel" },
  sameAs: [
    "https://github.com/circuitcoders",
    "https://x.com/circuitcoders",
    "https://linkedin.com/company/circuitcoders",
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
    addressLocality: "Fallbrook",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Fallbrook" },
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
    "Custom Hardware Engineering",
    "Firmware Development",
    "IoT Platform Development",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Flat-Fee Small Business Website",
      price: "499",
      priceCurrency: "USD",
      description:
        "Custom-coded small business website with on-page SEO, mobile-first design, and 48-hour turnaround.",
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
      </head>
      <body className="bg-carbon-500 text-white antialiased font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
