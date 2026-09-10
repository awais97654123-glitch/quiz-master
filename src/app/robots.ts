import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/quiz",
          "/quiz/*",
          "/topics",
          "/online-test",
          "/mcq",
          "/_next/static/",
          "/icon.svg",
          "/*.jpg",
          "/*.png",
          "/*.svg",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/profile/",
          "/settings/",
          "/history/",
          "/room/",
          "/live/",
          "/join/",
          "/quiz/single/",
          "/quiz/result/",
          "/quiz/create/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/quiz",
          "/quiz/*",
          "/topics",
          "/online-test",
          "/mcq",
          "/_next/static/",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/profile/",
          "/settings/",
          "/history/",
          "/room/",
          "/live/",
          "/quiz/single/",
          "/quiz/result/",
          "/quiz/create/",
          "/join/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
