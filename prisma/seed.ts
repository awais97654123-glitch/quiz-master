import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HTML_TOPICS = [
  "HTML Basics",
  "HTML Document Structure",
  "Elements",
  "Tags",
  "Attributes",
  "Headings",
  "Paragraphs",
  "Links",
  "Images",
  "Lists",
  "Tables",
  "Forms",
  "Input Elements",
  "Buttons",
  "Semantic HTML",
  "Header",
  "Footer",
  "Main",
  "Section",
  "Article",
  "Navigation",
  "Div",
  "Span",
  "Classes",
  "IDs",
  "HTML5",
  "Audio",
  "Video",
  "Canvas",
  "Accessibility",
  "Meta Tags",
  "Forms Validation",
  "HTML Best Practices",
];

const CSS_TOPICS = [
  "CSS Basics",
  "Selectors",
  "Classes",
  "IDs",
  "Colors",
  "Backgrounds",
  "Borders",
  "Margins",
  "Padding",
  "Box Model",
  "Width/Height",
  "Display",
  "Position",
  "Flexbox",
  "Grid",
  "Responsive Design",
  "Media Queries",
  "Typography",
  "Fonts",
  "Units",
  "Pseudo Classes",
  "Pseudo Elements",
  "Transitions",
  "Transforms",
  "Animations",
  "Variables",
  "Specificity",
  "Z-index",
  "Overflow",
  "Shadows",
  "Gradients",
  "Modern CSS",
  "CSS Best Practices",
];

const JS_TOPICS = [
  "JavaScript Basics",
  "Variables",
  "let",
  "const",
  "var",
  "Data Types",
  "Operators",
  "Conditions",
  "if/else",
  "switch",
  "Loops",
  "for",
  "while",
  "Functions",
  "Arrow Functions",
  "Scope",
  "Arrays",
  "Array Methods",
  "Objects",
  "Object Methods",
  "Strings",
  "Numbers",
  "Date",
  "Math",
  "DOM",
  "Events",
  "Event Listeners",
  "Forms",
  "JSON",
  "Local Storage",
  "Session Storage",
  "Promises",
  "Async/Await",
  "Fetch API",
  "Error Handling",
  "ES6+",
  "Modules",
  "Closures",
  "Hoisting",
  "Callbacks",
  "JavaScript Best Practices",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Starting CodeQuiz Arena database seed...");

  // 1. Create or ensure Demo Users
  const user1 = await prisma.user.upsert({
    where: { email: "demo@codequiz.arena" },
    update: {},
    create: {
      authProviderId: "demo-user-1",
      email: "demo@codequiz.arena",
      profile: {
        create: {
          name: "Alex Rivera",
          username: "alex_dev",
          institution: "Oxford University",
          avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
          bio: "Senior CS student & Full-stack enthusiast.",
          profileCompleted: true,
        },
      },
    },
    include: { profile: true },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "sarah@codequiz.arena" },
    update: {},
    create: {
      authProviderId: "demo-user-2",
      email: "sarah@codequiz.arena",
      profile: {
        create: {
          name: "Sarah Chen",
          username: "sarah_c",
          institution: "MIT Engineering",
          avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sarah",
          bio: "Frontend architect & algorithm contestant.",
          profileCompleted: true,
        },
      },
    },
    include: { profile: true },
  });

  console.log(`✓ Seeded demo users: ${user1.email}, ${user2.email}`);

  // 2. Seed Courses
  const htmlCourse = await prisma.course.upsert({
    where: { slug: "html" },
    update: { name: "HTML" },
    create: { name: "HTML", slug: "html" },
  });

  const cssCourse = await prisma.course.upsert({
    where: { slug: "css" },
    update: { name: "CSS" },
    create: { name: "CSS", slug: "css" },
  });

  const jsCourse = await prisma.course.upsert({
    where: { slug: "javascript" },
    update: { name: "JavaScript" },
    create: { name: "JavaScript", slug: "javascript" },
  });

  console.log("✓ Seeded courses: HTML, CSS, JavaScript");

  // 3. Seed Topics
  const topicRecords: Record<string, { id: string; name: string; courseId: string }> = {};

  for (const topicName of HTML_TOPICS) {
    const slug = slugify(topicName);
    const t = await prisma.topic.upsert({
      where: { courseId_slug: { courseId: htmlCourse.id, slug } },
      update: { name: topicName },
      create: { courseId: htmlCourse.id, name: topicName, slug },
    });
    topicRecords[`html:${topicName}`] = t;
  }

  for (const topicName of CSS_TOPICS) {
    const slug = slugify(topicName);
    const t = await prisma.topic.upsert({
      where: { courseId_slug: { courseId: cssCourse.id, slug } },
      update: { name: topicName },
      create: { courseId: cssCourse.id, name: topicName, slug },
    });
    topicRecords[`css:${topicName}`] = t;
  }

  for (const topicName of JS_TOPICS) {
    const slug = slugify(topicName);
    const t = await prisma.topic.upsert({
      where: { courseId_slug: { courseId: jsCourse.id, slug } },
      update: { name: topicName },
      create: { courseId: jsCourse.id, name: topicName, slug },
    });
    topicRecords[`javascript:${topicName}`] = t;
  }

  console.log(`✓ Seeded ${Object.keys(topicRecords).length} topics across courses`);

  // 4. Curated Question Bank
  const QUESTION_BANK = [
    // === HTML QUESTIONS ===
    {
      courseId: htmlCourse.id,
      topicName: "Semantic HTML",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "Which HTML5 semantic element is intended to encapsulate an independent, self-contained composition that could be distributed or reusable?",
      code: null,
      options: ["<article>", "<section>", "<aside>", "<div>"],
      correctAnswer: "<article>",
      explanation: "The <article> element specifies independent, self-contained content that can stand on its own and be syndicated (e.g. blog post, news story, forum thread).",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Forms",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "When submitting sensitive data such as a user password, which HTTP method attribute must be defined on the <form> element?",
      code: '<form action="/api/login" method="???">\n  <input type="password" name="pwd" />\n</form>',
      options: ["POST", "GET", "HEAD", "PUT"],
      correctAnswer: "POST",
      explanation: "Sensitive data must never be submitted using GET because GET appends form data to the URL query string, exposing it in browser history, server logs, and proxies. POST sends data inside the request body.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Input Elements",
      difficulty: "EASY",
      type: "mcq",
      question: "Which <input> type provides native browser support for an email input with built-in format validation upon form submission?",
      code: '<input type="email" name="user_email" required>',
      options: ['type="email"', 'type="text"', 'type="url"', 'type="string"'],
      correctAnswer: 'type="email"',
      explanation: "type=\"email\" activates client-side email format validation and triggers email-friendly virtual keyboards on mobile devices.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Div",
      difficulty: "EASY",
      type: "mcq",
      question: "What is the primary conceptual difference between a <div> element and a <span> element in HTML?",
      code: null,
      options: [
        "<div> is a block-level element by default, whereas <span> is an inline element",
        "<div> is semantic, whereas <span> is non-semantic",
        "<span> cannot contain any text content",
        "<div> only accepts classes, while <span> only accepts IDs",
      ],
      correctAnswer: "<div> is a block-level element by default, whereas <span> is an inline element",
      explanation: "<div> is a generic block-level container occupying full width on a new line, whereas <span> is an inline container intended for phrasing content within text flows.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Accessibility",
      difficulty: "HARD",
      type: "mcq",
      question: "Which of the following attributes should be placed on an image whose purpose is purely decorative so that screen readers correctly ignore it?",
      code: '<img src="divider-graphic.png" ??? >',
      options: ['alt=""', 'aria-hidden="false"', 'role="contentinfo"', 'title="decorative"'],
      correctAnswer: 'alt=""',
      explanation: "An empty alt attribute (alt=\"\") explicitly informs assistive technologies that the image is presentational and should be skipped by screen readers.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Meta Tags",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "What does the meta tag '<meta charset=\"UTF-8\">' specify for the browser?",
      code: '<meta charset="UTF-8">',
      options: [
        "The character encoding used to decode the document's bytes into characters",
        "The language dictionary for spell checking",
        "The maximum size limit of the HTML document",
        "The encryption cipher for HTTPS transfers",
      ],
      correctAnswer: "The character encoding used to decode the document's bytes into characters",
      explanation: "UTF-8 meta tag defines the character encoding scheme covering almost all characters and symbols from world languages.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Canvas",
      difficulty: "HARD",
      type: "mcq",
      question: "Which method is used on an HTML <canvas> element to obtain the 2D rendering context object?",
      code: "const canvas = document.getElementById('myCanvas');\nconst ctx = canvas.???('2d');",
      options: ["getContext", "getRenderingContext", "createContext", "fetch2D"],
      correctAnswer: "getContext",
      explanation: "canvas.getContext('2d') returns a CanvasRenderingContext2D object representing a two-dimensional rendering context.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Audio",
      difficulty: "EASY",
      type: "mcq",
      question: "Which attribute must be added to the <audio> element to show native playback controls (play, pause, volume)?",
      code: '<audio src="track.mp3" ???></audio>',
      options: ["controls", "autoplay", "interface", "enable-ui"],
      correctAnswer: "controls",
      explanation: "The 'controls' boolean attribute tells the browser to render default playback controls for play/pause, volume, and seeking.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Classes",
      difficulty: "EASY",
      type: "mcq",
      question: "Can an HTML element have multiple classes assigned to its 'class' attribute? If yes, how are they separated?",
      code: '<div class="card card-dark is-active"></div>',
      options: [
        "Yes, separated by spaces",
        "Yes, separated by commas",
        "Yes, separated by semicolons",
        "No, an element can only have one class",
      ],
      correctAnswer: "Yes, separated by spaces",
      explanation: "Multiple CSS classes are specified within the class attribute separated by single space characters.",
    },
    {
      courseId: htmlCourse.id,
      topicName: "Forms Validation",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "What does the 'novalidate' attribute do when placed on a <form> element?",
      code: '<form action="/submit" method="POST" novalidate>',
      options: [
        "It suppresses native browser constraint validation upon submission",
        "It marks all form fields as optional",
        "It disables JavaScript from reading form values",
        "It clears form fields immediately on submit",
      ],
      correctAnswer: "It suppresses native browser constraint validation upon submission",
      explanation: "The novalidate boolean attribute prevents the browser from performing default HTML5 constraint validation when submitting the form, allowing custom JS validation.",
    },

    // === CSS QUESTIONS ===
    {
      courseId: cssCourse.id,
      topicName: "Flexbox",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "In a flex container with 'flex-direction: row', which property aligns items along the cross axis (vertical)?",
      code: ".container {\n  display: flex;\n  flex-direction: row;\n  ???: center;\n}",
      options: ["align-items", "justify-content", "align-content", "flex-wrap"],
      correctAnswer: "align-items",
      explanation: "In a row flex container, justify-content controls alignment along the main axis (horizontal), while align-items aligns items along the cross axis (vertical).",
    },
    {
      courseId: cssCourse.id,
      topicName: "Grid",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "What is the result of applying 'grid-template-columns: repeat(3, 1fr);' to a grid container?",
      code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}",
      options: [
        "Three equal-width columns that each occupy one fraction of available space",
        "Three columns with fixed 1px widths",
        "A 3x3 grid with 9 cells of random widths",
        "A responsive layout that drops columns below 300px",
      ],
      correctAnswer: "Three equal-width columns that each occupy one fraction of available space",
      explanation: "repeat(3, 1fr) creates three tracks, each taking 1 fraction (1fr) of the available container width equally.",
    },
    {
      courseId: cssCourse.id,
      topicName: "Box Model",
      difficulty: "HARD",
      type: "mcq",
      question: "When 'box-sizing: border-box' is applied to an element with width: 300px, padding: 20px, and border: 2px, what is its total rendered width?",
      code: ".box {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 20px;\n  border: 2px solid black;\n}",
      options: ["300px", "344px", "322px", "256px"],
      correctAnswer: "300px",
      explanation: "With border-box, the specified width includes padding and border. The content area shrinks so the total rendered width remains exactly 300px.",
    },
    {
      courseId: cssCourse.id,
      topicName: "Position",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "An element with 'position: absolute' positions itself relative to what ancestor?",
      code: ".tooltip {\n  position: absolute;\n  top: 10px;\n  left: 20px;\n}",
      options: [
        "Its closest ancestor with a position other than 'static'",
        "Always the root <html> viewport element",
        "Its immediate parent element regardless of positioning",
        "The nearest block-level container",
      ],
      correctAnswer: "Its closest ancestor with a position other than 'static'",
      explanation: "An absolutely positioned element is removed from normal flow and positioned relative to its nearest positioned ancestor (relative, absolute, fixed, or sticky).",
    },
    {
      courseId: cssCourse.id,
      topicName: "Specificity",
      difficulty: "HARD",
      type: "mcq",
      question: "Which of the following selectors has the highest CSS specificity value?",
      code: "A: #nav .list-item a\nB: nav ul.list-item li a:hover\nC: #nav #active-link\nD: .sidebar .menu .item.active a",
      options: [
        "Selector C (#nav #active-link)",
        "Selector A (#nav .list-item a)",
        "Selector B (nav ul.list-item li a:hover)",
        "Selector D (.sidebar .menu .item.active a)",
      ],
      correctAnswer: "Selector C (#nav #active-link)",
      explanation: "Selector C has 2 ID selectors (2, 0, 0), which overrides any selector with fewer IDs regardless of how many classes or elements they contain.",
    },
    {
      courseId: cssCourse.id,
      topicName: "Variables",
      difficulty: "EASY",
      type: "mcq",
      question: "How is a CSS custom property (variable) correctly retrieved in modern CSS?",
      code: ":root {\n  --brand-color: #3b82f6;\n}\n.button {\n  background: ???;\n}",
      options: [
        "var(--brand-color)",
        "$brand-color",
        "env(--brand-color)",
        "@brand-color",
      ],
      correctAnswer: "var(--brand-color)",
      explanation: "The var() function is the standard CSS mechanism to insert the value of a custom property (prefixed with double dashes --).",
    },
    {
      courseId: cssCourse.id,
      topicName: "Z-index",
      difficulty: "HARD",
      type: "mcq",
      question: "Why might an element with 'z-index: 9999' still appear underneath an element with 'z-index: 1'?",
      code: null,
      options: [
        "Its parent creates a lower stacking context that sits below the other element's stacking context",
        "z-index only supports values between 0 and 100",
        "The element must have display: flex to support z-index",
        "z-index values above 1000 are automatically reset to 0 by browsers",
      ],
      correctAnswer: "Its parent creates a lower stacking context that sits below the other element's stacking context",
      explanation: "Stacking contexts are hierarchical. If a parent stacking context is below another stacking context, children inside it cannot pierce out to appear above the higher context regardless of their internal z-index.",
    },
    {
      courseId: cssCourse.id,
      topicName: "Responsive Design",
      difficulty: "EASY",
      type: "mcq",
      question: "Which CSS at-rule is used to apply style rules conditionally based on device characteristics such as screen width?",
      code: "??? (min-width: 768px) {\n  .sidebar { display: block; }\n}",
      options: ["@media", "@supports", "@container", "@viewport"],
      correctAnswer: "@media",
      explanation: "@media queries allow styling rules to be conditioned on viewport dimensions, orientation, resolution, and media types.",
    },

    // === JAVASCRIPT QUESTIONS ===
    {
      courseId: jsCourse.id,
      topicName: "Closures",
      difficulty: "HARD",
      type: "mcq",
      question: "What will be printed to the console when the following snippet executes?",
      code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 50);\n}",
      options: ["3, 3, 3", "0, 1, 2", "undefined, undefined, undefined", "0, 0, 0"],
      correctAnswer: "3, 3, 3",
      explanation: "Because 'var' is function-scoped rather than block-scoped, all three setTimeout callbacks close over the exact same 'i' variable. When the callbacks fire after 50ms, the loop has finished and 'i' equals 3.",
    },
    {
      courseId: jsCourse.id,
      topicName: "Promises",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "What is the execution order of the console logs in this JavaScript snippet?",
      code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
      options: ["A, D, C, B", "A, B, C, D", "A, C, D, B", "A, D, B, C"],
      correctAnswer: "A, D, C, B",
      explanation: "A and D execute synchronously in the call stack. Promise microtasks run immediately after synchronous execution (C). Macrotasks like setTimeout callbacks execute in the next tick of the event loop (B).",
    },
    {
      courseId: jsCourse.id,
      topicName: "Array Methods",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "Which JavaScript array method creates a new array with all elements that pass the test implemented by the provided function?",
      code: "const numbers = [12, 5, 8, 130, 44];\nconst big = numbers.???(x => x >= 10);",
      options: ["filter", "map", "find", "reduce"],
      correctAnswer: "filter",
      explanation: "Array.prototype.filter() returns a shallow copy of a portion of the given array, filtered down to just the elements from the given array that pass the test.",
    },
    {
      courseId: jsCourse.id,
      topicName: "Hoisting",
      difficulty: "HARD",
      type: "mcq",
      question: "What happens when executing the following JavaScript code?",
      code: "console.log(myVar);\nconsole.log(myLet);\nvar myVar = 10;\nlet myLet = 20;",
      options: [
        "Prints undefined, then throws ReferenceError",
        "Prints 10, then prints 20",
        "Throws ReferenceError on the first line",
        "Prints undefined, then prints undefined",
      ],
      correctAnswer: "Prints undefined, then throws ReferenceError",
      explanation: "'var' declarations are hoisted and initialized to 'undefined'. 'let' declarations are hoisted into the Temporal Dead Zone (TDZ) and cannot be accessed before declaration, throwing a ReferenceError.",
    },
    {
      courseId: jsCourse.id,
      topicName: "Arrow Functions",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "How does the 'this' keyword behave inside an ES6 arrow function?",
      code: "const obj = {\n  val: 42,\n  getVal: () => this.val\n};",
      options: [
        "It lexically binds 'this' from the enclosing execution context",
        "It binds dynamically to the object calling the function",
        "It is always undefined in strict mode",
        "It automatically binds to the nearest class instance",
      ],
      correctAnswer: "It lexically binds 'this' from the enclosing execution context",
      explanation: "Arrow functions do not have their own 'this' binding. Instead, 'this' is resolved lexically from the scope in which the arrow function was defined.",
    },
    {
      courseId: jsCourse.id,
      topicName: "DOM",
      difficulty: "EASY",
      type: "mcq",
      question: "Which method returns the first Element within the document that matches the specified CSS selector?",
      code: "const element = document.???('.active-user');",
      options: ["querySelector", "querySelectorAll", "getElementById", "getElementsByClassName"],
      correctAnswer: "querySelector",
      explanation: "document.querySelector() returns the first element that matches the specified CSS selector, or null if no matches are found.",
    },
    {
      courseId: jsCourse.id,
      topicName: "Async/Await",
      difficulty: "HARD",
      type: "mcq",
      question: "What is the return value of an async function that does not contain an explicit 'return' statement?",
      code: "async function test() {\n  await doSomething();\n}",
      options: [
        "A Promise that resolves to undefined",
        "undefined",
        "null",
        "A rejected Promise",
      ],
      correctAnswer: "A Promise that resolves to undefined",
      explanation: "Async functions always return a Promise. If no return value is specified, the returned Promise resolves to undefined.",
    },
    {
      courseId: jsCourse.id,
      topicName: "Event Listeners",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "What is the purpose of 'event.stopPropagation()' in a DOM event listener?",
      code: "button.addEventListener('click', (e) => {\n  e.stopPropagation();\n});",
      options: [
        "It prevents further propagation of the current event in the capturing and bubbling phases",
        "It prevents the default action of the element (e.g. following a link)",
        "It removes the event listener immediately after execution",
        "It terminates JavaScript execution on the thread",
      ],
      correctAnswer: "It prevents further propagation of the current event in the capturing and bubbling phases",
      explanation: "stopPropagation() stops the event from dispatching further up or down the DOM tree, whereas preventDefault() prevents the user-agent default action.",
    },
  ];

  let insertedCount = 0;
  for (const q of QUESTION_BANK) {
    const coursePrefix = q.courseId === htmlCourse.id ? "html" : q.courseId === cssCourse.id ? "css" : "javascript";
    const topicRecord = topicRecords[`${coursePrefix}:${q.topicName}`];

    if (!topicRecord) {
      console.warn(`Topic not found: ${coursePrefix}:${q.topicName}`);
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: {
        courseId: q.courseId,
        topicId: topicRecord.id,
        question: q.question,
      },
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          courseId: q.courseId,
          topicId: topicRecord.id,
          difficulty: q.difficulty,
          type: q.type,
          question: q.question,
          code: q.code,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          generationSource: "system",
        },
      });
      insertedCount++;
    }
  }

  console.log(`✓ Seeded ${insertedCount} curated questions into the question bank`);
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
