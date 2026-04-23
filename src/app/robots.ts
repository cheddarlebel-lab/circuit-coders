import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/portal", "/portal/", "/api/"],
      },
    ],
    sitemap: "https://circuitcoders.com/sitemap.xml",
    host: "https://circuitcoders.com",
  };
}
