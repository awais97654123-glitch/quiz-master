import { getSiteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "./seo";

export interface BreadcrumbItem {
  name?: string;
  label?: string;
  url?: string;
  path?: string;
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
 * Generate Schema.org Course JSON-LD
 */
export function generateCourseSchema({
  name,
  description,
  courseSlug,
}: {
  name: string;
  description: string;
  courseSlug: string;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    url: `${siteUrl}/courses/${courseSlug}`,
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
    itemListElement: items.map((item, index) => {
      const name = item.name || item.label || `Page ${index + 1}`;
      const targetUrl = item.url || item.path || "/";
      const fullUrl = targetUrl.startsWith("http")
        ? targetUrl
        : `${siteUrl}${targetUrl.startsWith("/") ? "" : "/"}${targetUrl}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        name,
        item: fullUrl,
      };
    }),
  };
}

/**
 * Generate Schema.org Quiz JSON-LD for educational assessment pages
 */
export function generateQuizSchema(params: {
  name?: string;
  topicName?: string;
  description?: string;
  url?: string;
  courseName: string;
  courseSlug?: string;
  topicSlug?: string;
  questionCount: number;
  sampleQuestions?: Array<{ question: string; options: string[]; correctAnswer: string }>;
}) {
  const siteUrl = getSiteUrl();
  const quizTitle =
    params.name || (params.topicName ? `${params.topicName} Quiz — ${params.courseName}` : `${params.courseName} Quiz`);
  const quizDesc =
    params.description ||
    `Practice verified multiple-choice questions in ${params.topicName || params.courseName} with instant evaluation.`;
  const relativeUrl =
    params.url ||
    (params.courseSlug && params.topicSlug
      ? `/courses/${params.courseSlug}/${params.topicSlug}`
      : `/courses/${params.courseSlug || "general"}`);
  const canonicalUrl = relativeUrl.startsWith("http")
    ? relativeUrl
    : `${siteUrl}${relativeUrl.startsWith("/") ? "" : "/"}${relativeUrl}`;

  const sampleQuestions = params.sampleQuestions || [];

  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "@id": `${canonicalUrl}/#quiz`,
    name: quizTitle,
    description: quizDesc,
    url: canonicalUrl,
    educationalLevel: "Beginner to Advanced",
    learningResourceType: "Quiz",
    about: {
      "@type": "Thing",
      name: params.courseName,
    },
    numberOfQuestions: params.questionCount,
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
