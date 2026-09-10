import type { Metadata } from "next";

/**
 * Production Site URL resolution
 * Ensures NO localhost URLs are used in production metadata
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }
  return "https://quiz-join.vercel.app";
}

export const SITE_NAME = "Quiz Master Arena";
export const DEFAULT_TITLE = "Quiz Master Arena — Free Online Quizzes & Practice Tests";
export const DEFAULT_DESCRIPTION =
  "Test and master your HTML, CSS, and JavaScript skills with free interactive MCQs, server-authoritative timers, real-time multiplayer arena rooms, and comprehensive explanations.";

export const DEFAULT_KEYWORDS = [
  "online quiz",
  "free online quiz",
  "online test",
  "MCQ quiz",
  "practice quiz",
  "HTML quiz",
  "CSS quiz",
  "JavaScript quiz",
  "programming quiz",
  "coding quiz",
  "HTML MCQs",
  "CSS MCQs",
  "JavaScript MCQs",
  "student quiz",
  "computer science quiz",
  "web development quiz",
  "online practice test",
];

/**
 * Builds a strict, canonical URL for any route path
 */
export function buildCanonicalUrl(path: string = ""): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash except for root
  const normalizedPath = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/, "");
  return `${base}${normalizedPath}`;
}

/**
 * Generates standardized Next.js 15 metadata
 */
export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
  image = "/quizmaster-logo.jpg",
}: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
} = {}): Metadata {
  const canonicalUrl = buildCanonicalUrl(path);
  const siteUrl = getSiteUrl();
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;

  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

  return {
    title: title ? { absolute: resolvedTitle } : DEFAULT_TITLE,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${title || SITE_NAME} - Web Development Quiz & Assessment Arena`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [fullImageUrl],
      creator: "@quizmaster",
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    },
  };
}

/**
 * Standard NoIndex metadata for private application routes
 */
export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
