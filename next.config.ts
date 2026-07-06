import type { NextConfig } from "next";

// Content-Security-Policy scoped to what the site actually loads:
// - Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
// - Leaflet basemap tiles (*.basemaps.cartocdn.com) + Nominatim geocoding (admin map)
// - Stripe Checkout (js.stripe.com / checkout.stripe.com)
// 'unsafe-inline'/'unsafe-eval' are required by Next.js hydration + Framer Motion inline styles.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://nominatim.openstreetmap.org https://api.stripe.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
