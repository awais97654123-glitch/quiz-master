import { getSiteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "./seo";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Generate Schema.org WebSite JSON-LD with Sitelinks SearchBox
 */
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

/**
 * Generate Schema.org Organization JSON-LD
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/quizmaster-logo.jpg`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://github.com/awais97654123-glitch/quiz-master",
      "https://twitter.com/quizmaster",
    ],
  };
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };
}

/**
 * Generate Schema.org Quiz JSON-LD for educational assessment pages
 */
export function generateQuizSchema({
  name,
  description,
  url,
  courseName,
  questionCount,
  sampleQuestions = [],
}: {
  name: string;
  description: string;
  url: string;
  courseName: string;
  questionCount: number;
  sampleQuestions?: Array<{ question: string; options: string[]; correctAnswer: string }>;
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = url.startsWith("http") ? url : `${siteUrl}${url.startsWith("/") ? "" : "/"}${url}`;

  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "@id": `${canonicalUrl}/#quiz`,
    name,
    description,
    url: canonicalUrl,
    educationalLevel: "Beginner to Advanced",
    learningResourceType: "Quiz",
    about: {
      "@type": "Thing",
      name: courseName,
    },
    numberOfQuestions: questionCount,
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    ...(sampleQuestions.length > 0 && {
      hasPart: sampleQuestions.map((q) => ({
        "@type": "Question",
        name: q.question,
        text: q.question,
        suggestedAnswer: q.options.map((opt) => ({
          "@type": "Answer",
          text: opt,
        })),
        acceptedAnswer: {
          "@type": "Answer",
          text: q.correctAnswer,
        },
      })),
    }),
  };
}

/**
 * Generate Schema.org FAQPage JSON-LD
 * Strictly matches visible on-page content per Google Search guidelines
 */
export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
