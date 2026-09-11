import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date();

  // Core High-Priority Static Landing Hubs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/practice`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/quiz`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/online-test`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mcq`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/topics`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    // Dynamic Course and Topic Educational Guides from Database
    const courses = await prisma.course.findMany({
      include: {
        topics: {
          select: {
            slug: true,
          },
        },
      },
    });

    const dynamicCourseRoutes: MetadataRoute.Sitemap = courses.flatMap((c) => [
      {
        url: `${siteUrl}/courses/${c.slug}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: `${siteUrl}/quiz/${c.slug}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      },
    ]);

    const dynamicTopicRoutes: MetadataRoute.Sitemap = courses.flatMap((c) =>
      c.topics.flatMap((t) => [
        {
          url: `${siteUrl}/courses/${c.slug}/${t.slug}`,
          lastModified: currentDate,
          changeFrequency: "weekly" as const,
          priority: 0.85,
        },
        {
          url: `${siteUrl}/quiz/${c.slug}/${t.slug}`,
          lastModified: currentDate,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
      ])
    );

    return [...staticRoutes, ...dynamicCourseRoutes, ...dynamicTopicRoutes];
  } catch (err) {
    console.error("Sitemap dynamic database fetch error, returning static routes:", err);
    // Safe fallback ensuring build/sitemap never crashes
    const fallbackCourseRoutes: MetadataRoute.Sitemap = [
      {
        url: `${siteUrl}/courses/html`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/courses/css`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/courses/javascript`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];
    return [...staticRoutes, ...fallbackCourseRoutes];
  }
}
