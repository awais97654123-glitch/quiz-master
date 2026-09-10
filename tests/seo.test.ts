import { describe, it, expect } from "vitest";
import { getSiteUrl, buildCanonicalUrl, constructMetadata, NO_INDEX_METADATA } from "../src/lib/seo";
import robots from "../src/app/robots";
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateQuizSchema,
  generateFaqSchema,
} from "../src/lib/schema-generator";

describe("Technical SEO Architecture & Helpers", () => {
  it("should resolve valid production site URL without trailing slash", () => {
    const url = getSiteUrl();
    expect(url).toBeDefined();
    expect(url.startsWith("http")).toBe(true);
    expect(url.endsWith("/")).toBe(false);
  });

  it("should build canonical URLs without trailing slash or duplicate slashes", () => {
    const siteUrl = getSiteUrl();
    expect(buildCanonicalUrl("/")).toBe(siteUrl);
    expect(buildCanonicalUrl("/quiz/javascript")).toBe(`${siteUrl}/quiz/javascript`);
    expect(buildCanonicalUrl("quiz/css/")).toBe(`${siteUrl}/quiz/css`);
  });

  it("should construct complete Next.js 15 metadata", () => {
    const meta = constructMetadata({
      title: "JavaScript Quiz",
      description: "Test your JS skills with MCQs",
      path: "/quiz/javascript",
    });

    expect(meta.title).toEqual({ absolute: "JavaScript Quiz | Quiz Master Arena" });
    expect(meta.description).toBe("Test your JS skills with MCQs");
    expect(meta.alternates?.canonical).toBe(buildCanonicalUrl("/quiz/javascript"));
    expect(meta.openGraph?.url).toBe(buildCanonicalUrl("/quiz/javascript"));
    expect(meta.twitter?.card).toBe("summary_large_image");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it("should properly configure NO_INDEX_METADATA for private routes", () => {
    expect(NO_INDEX_METADATA.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});

describe("Robots.txt Configuration", () => {
  it("should allow public educational routes and block private app routes", () => {
    const robotsConfig = robots();
    expect(robotsConfig.sitemap).toBeDefined();
    expect(robotsConfig.sitemap).toContain("/sitemap.xml");

    const globalRule = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules.find((r) => r.userAgent === "*")
      : robotsConfig.rules;

    expect(globalRule).toBeDefined();
    const allowed = (globalRule?.allow as string[]) || [];
    const disallowed = (globalRule?.disallow as string[]) || [];

    // Verify public pages allowed
    expect(allowed).toContain("/");
    expect(allowed).toContain("/quiz");
    expect(allowed).toContain("/quiz/*");
    expect(allowed).toContain("/topics");
    expect(allowed).toContain("/online-test");
    expect(allowed).toContain("/mcq");

    // Verify private pages disallowed
    expect(disallowed).toContain("/dashboard/");
    expect(disallowed).toContain("/profile/");
    expect(disallowed).toContain("/admin/");
    expect(disallowed).toContain("/room/");
    expect(disallowed).toContain("/live/");
    expect(disallowed).toContain("/quiz/single/");
    expect(disallowed).toContain("/quiz/result/");
    expect(disallowed).toContain("/quiz/create/");
  });
});

describe("Schema.org JSON-LD Structured Data", () => {
  it("should generate valid WebSite schema with search action", () => {
    const schema = generateWebSiteSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.potentialAction).toBeDefined();
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
  });

  it("should generate valid Organization schema", () => {
    const schema = generateOrganizationSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.logo).toBeDefined();
  });

  it("should generate valid BreadcrumbList schema with sequential positions", () => {
    const breadcrumbs = [
      { name: "Quizzes", url: "/quiz" },
      { name: "JavaScript Quiz", url: "/quiz/javascript" },
      { name: "Promises", url: "/quiz/javascript/promises" },
    ];
    const schema = generateBreadcrumbSchema(breadcrumbs);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it("should generate valid Quiz schema with questions", () => {
    const schema = generateQuizSchema({
      name: "HTML Quiz",
      description: "Test HTML knowledge",
      url: "/quiz/html",
      courseName: "HTML",
      questionCount: 35,
      sampleQuestions: [
        {
          question: "Which tag is semantic?",
          options: ["div", "span", "article", "b"],
          correctAnswer: "article",
        },
      ],
    });

    expect(schema["@type"]).toBe("Quiz");
    expect(schema.name).toBe("HTML Quiz");
    expect(schema.numberOfQuestions).toBe(35);
    expect(schema.hasPart).toHaveLength(1);
    expect(schema.hasPart?.[0].acceptedAnswer.text).toBe("article");
  });

  it("should generate valid FAQPage schema matching visible content", () => {
    const faqs = [
      { question: "Is this quiz free?", answer: "Yes, 100% free." },
      { question: "Can I retake?", answer: "Unlimited retakes are allowed." },
    ];
    const schema = generateFaqSchema(faqs);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0].name).toBe("Is this quiz free?");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Yes, 100% free.");
  });
});
