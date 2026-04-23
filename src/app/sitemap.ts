import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const SITE = "https://circuitcoders.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/#services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/#website-demos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/#portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/#process`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/shop`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}
