import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PART2_QUESTIONS = [
  // JS Loops
  {
    courseSlug: "javascript",
    topicName: "Loops",
    difficulty: "EASY",
    type: "mcq",
    question: "Which loop construct is guaranteed to execute its code block at least once before checking the condition?",
    options: ["do...while", "while", "for", "for...of"],
    correctAnswer: "do...while",
    explanation: "A do...while loop evaluates its conditional statement at the end of the loop, ensuring the block runs at least once.",
  },
  {
    courseSlug: "javascript",
    topicName: "Loops",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What is the key difference between 'for...in' and 'for...of' in JavaScript?",
    options: [
      "'for...in' iterates over enumerable property keys, while 'for...of' iterates over iterable values",
      "'for...of' only works on Plain Objects, while 'for...in' works on Arrays",
      "'for...in' is asynchronous, while 'for...of' is synchronous",
      "There is no difference between them",
    ],
    correctAnswer: "'for...in' iterates over enumerable property keys, while 'for...of' iterates over iterable values",
    explanation: "for...in traverses property names/indices (keys); for...of iterates over values of iterable collections like Arrays, Maps, and Sets.",
  },
  {
    courseSlug: "javascript",
    topicName: "Functions",
    difficulty: "EASY",
    type: "mcq",
    question: "What value is returned by a JavaScript function that does not explicitly execute a 'return' statement?",
    options: ["undefined", "null", "0", "false"],
    correctAnswer: "undefined",
    explanation: "In JavaScript, any function that finishes without a return statement returns undefined by default.",
  },
  {
    courseSlug: "javascript",
    topicName: "Functions",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What is the rest parameter syntax used to represent an indefinite number of arguments as an array?",
    code: "function sum(...numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}",
    options: ["...numbers", "arguments", "*numbers", "args[]"],
    correctAnswer: "...numbers",
    explanation: "The rest parameter syntax (...identifier) allows a function to accept an arbitrary number of arguments as an actual Array instance.",
  },
  {
    courseSlug: "javascript",
    topicName: "Strings",
    difficulty: "EASY",
    type: "mcq",
    question: "Which string method determines whether a string contains the characters of a specified string, returning true or false?",
    options: ["includes()", "contains()", "indexOf() === 0", "has()"],
    correctAnswer: "includes()",
    explanation: "String.prototype.includes() performs a case-sensitive search to determine whether one string may be found within another.",
  },
  {
    courseSlug: "javascript",
    topicName: "Strings",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What syntax is used in ES6 Template Literals for string interpolation?",
    code: "const greeting = `Hello, ${name}!`;",
    options: ["${expression}", "{{expression}}", "$[expression]", "%(expression)"],
    correctAnswer: "${expression}",
    explanation: "Template literals enclosed by backticks (``) use ${expression} placeholders for embedded expressions and multi-line strings.",
  },
  {
    courseSlug: "javascript",
    topicName: "Numbers",
    difficulty: "EASY",
    type: "mcq",
    question: "Which global JavaScript method parses a string argument and returns an integer of the specified radix?",
    options: ["parseInt()", "parseFloat()", "Number.toInt()", "Math.round()"],
    correctAnswer: "parseInt()",
    explanation: "parseInt(string, radix) parses a string and returns an integer of the specified numeral system radix.",
  },
  {
    courseSlug: "javascript",
    topicName: "Numbers",
    difficulty: "HARD",
    type: "mcq",
    question: "Why does '0.1 + 0.2 === 0.3' evaluate to false in JavaScript?",
    options: [
      "Due to IEEE 754 double-precision binary floating-point rounding errors (0.1 + 0.2 is 0.30000000000000004)",
      "Because JavaScript converts decimal additions into strings",
      "Because the equality operator does not support floats",
      "Because 0.3 is treated as an octal integer",
    ],
    correctAnswer: "Due to IEEE 754 double-precision binary floating-point rounding errors (0.1 + 0.2 is 0.30000000000000004)",
    explanation: "Numbers in JS are 64-bit binary floats (IEEE 754). Decimal fractions like 0.1 and 0.2 cannot be represented with exact precision in base-2.",
  },
  {
    courseSlug: "javascript",
    topicName: "Conditions",
    difficulty: "EASY",
    type: "mcq",
    question: "Which ternary operator syntax is equivalent to a simple if-else statement?",
    options: [
      "condition ? expressionIfTrue : expressionIfFalse",
      "condition : expressionIfTrue ? expressionIfFalse",
      "if (condition) -> expressionIfTrue",
      "condition ? (expressionIfTrue, expressionIfFalse)",
    ],
    correctAnswer: "condition ? expressionIfTrue : expressionIfFalse",
    explanation: "The conditional (ternary) operator takes three operands: condition followed by ?, then exprIfTrue, a colon (:), and exprIfFalse.",
  },
  {
    courseSlug: "javascript",
    topicName: "Modules",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What is the primary difference between a 'default' export and a 'named' export in ES Modules?",
    options: [
      "A module can have only one default export, which can be imported with any arbitrary name, while named exports must match their export name",
      "Default exports are evaluated lazily, while named exports are eager",
      "Named exports can only export functions",
      "Default exports cannot be combined with named exports in the same file",
    ],
    correctAnswer: "A module can have only one default export, which can be imported with any arbitrary name, while named exports must match their export name",
    explanation: "Each module can have at most one default export, imported as 'import myName from ...', whereas named exports require matching curly brace syntax.",
  },

  // CSS Topics
  {
    courseSlug: "css",
    topicName: "Colors",
    difficulty: "EASY",
    type: "mcq",
    question: "What does the 'A' represent in the CSS 'rgba(255, 0, 0, 0.5)' color notation?",
    options: ["Alpha channel (opacity)", "Ambient lighting", "Automatic contrast", "Active state"],
    correctAnswer: "Alpha channel (opacity)",
    explanation: "The 'a' parameter in rgba specifies alpha transparency, ranging from 0.0 (completely transparent) to 1.0 (fully opaque).",
  },
  {
    courseSlug: "css",
    topicName: "Colors",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What color format uses Hue (0-360 degrees), Saturation (%), and Lightness (%) in modern CSS?",
    options: ["hsl()", "rgb()", "cmyk()", "hex()"],
    correctAnswer: "hsl()",
    explanation: "hsl() represents colors by their cylindrical-coordinate hue angle, saturation percentage, and lightness percentage.",
  },
  {
    courseSlug: "css",
    topicName: "Transitions",
    difficulty: "EASY",
    type: "mcq",
    question: "Which CSS property determines how long an animation transition takes to complete?",
    options: ["transition-duration", "transition-delay", "transition-timing", "transition-speed"],
    correctAnswer: "transition-duration",
    explanation: "transition-duration specifies the duration of time that transitions should take to run (e.g. 300ms, 1s).",
  },
  {
    courseSlug: "css",
    topicName: "Transitions",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What does 'transition-timing-function: ease-in-out' define?",
    options: [
      "A transition curve that starts slow, accelerates in the middle, and slows down at the end",
      "A linear speed graph with no acceleration",
      "A transition that plays in reverse every other loop",
      "A transition with bounce overshoot at the boundary",
    ],
    correctAnswer: "A transition curve that starts slow, accelerates in the middle, and slows down at the end",
    explanation: "ease-in-out creates a smooth acceleration curve at the start and deceleration at the finish.",
  },
  {
    courseSlug: "css",
    topicName: "Transforms",
    difficulty: "EASY",
    type: "mcq",
    question: "Which CSS transform function is used to rotate an element around a fixed point?",
    options: ["rotate(45deg)", "spin(45deg)", "turn(45deg)", "angle(45deg)"],
    correctAnswer: "rotate(45deg)",
    explanation: "The rotate() CSS function rotates an element around a fixed point on the 2D plane.",
  },
  {
    courseSlug: "css",
    topicName: "Transforms",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "Why are CSS transforms and opacity preferred over margin and top/left for UI animations?",
    options: [
      "They can be offloaded to the GPU and do not trigger expensive browser layout or repaint phases",
      "They require fewer lines of CSS code",
      "They automatically work in offline web workers",
      "They ignore z-index stacking orders",
    ],
    correctAnswer: "They can be offloaded to the GPU and do not trigger expensive browser layout or repaint phases",
    explanation: "Transform and opacity changes are composited directly on the GPU, avoiding CPU layout recalculation (reflow) and repaint.",
  },
  {
    courseSlug: "css",
    topicName: "Z-index",
    difficulty: "HARD",
    type: "mcq",
    question: "Under what condition does the 'z-index' property take effect on an element?",
    options: [
      "When the element has a positioned context other than 'static' (or is a flex/grid child)",
      "Only when float: left is applied",
      "Whenever the element contains text nodes",
      "Only when the browser window is in fullscreen mode",
    ],
    correctAnswer: "When the element has a positioned context other than 'static' (or is a flex/grid child)",
    explanation: "z-index only applies to positioned elements (relative, absolute, fixed, sticky) and direct flex/grid child items.",
  },
  {
    courseSlug: "css",
    topicName: "Units",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "What is the primary difference between 'em' and 'rem' units in CSS?",
    options: [
      "'rem' is relative to the root (<html>) font-size, while 'em' is relative to the font-size of the element's parent",
      "'em' is an absolute unit, while 'rem' is responsive",
      "'rem' only applies to margins, while 'em' only applies to fonts",
      "There is no difference; 'rem' is just shorthand for 'root-em'",
    ],
    correctAnswer: "'rem' is relative to the root (<html>) font-size, while 'em' is relative to the font-size of the element's parent",
    explanation: "rem (root em) avoids compounding scale issues because it always refers back to the <html> element's font size (typically 16px).",
  },
  {
    courseSlug: "css",
    topicName: "Pseudo Classes",
    difficulty: "EASY",
    type: "mcq",
    question: "Which pseudo-class applies styling when the user focuses on an input or keyboard element?",
    options: [":focus", ":hover", ":active", ":visited"],
    correctAnswer: ":focus",
    explanation: "The :focus pseudo-class represents an element that has received focus, such as via keyboard Tab navigation or clicking an input.",
  },
  {
    courseSlug: "css",
    topicName: "Pseudo Elements",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "Which CSS property is required for '::before' and '::after' pseudo-elements to render on screen?",
    options: ["content: ''", "display: block", "visibility: visible", "position: relative"],
    correctAnswer: "content: ''",
    explanation: "Without the 'content' property (even if empty content: ''), generated pseudo-elements will not be created in the DOM.",
  },

  // HTML Topics
  {
    courseSlug: "html",
    topicName: "Forms Validation",
    difficulty: "EASY",
    type: "mcq",
    question: "Which boolean attribute prevents form submission if an <input> field is left empty?",
    options: ["required", "validate", "not-empty", "mandatory"],
    correctAnswer: "required",
    explanation: "The 'required' attribute enforces browser validation, blocking form submission if the input has no value.",
  },
  {
    courseSlug: "html",
    topicName: "Forms Validation",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "Which attribute sets the minimum and maximum acceptable numeric values on an <input type='number'>?",
    options: ["min and max", "low and high", "start and end", "range-min and range-max"],
    correctAnswer: "min and max",
    explanation: "The min and max attributes define the allowable value boundary for numeric and date inputs.",
  },
  {
    courseSlug: "html",
    topicName: "Audio",
    difficulty: "EASY",
    type: "mcq",
    question: "Which attribute must be added to an <audio> tag for the browser to display play, pause, and volume controls?",
    options: ["controls", "autoplay", "show-player", "interactive"],
    correctAnswer: "controls",
    explanation: "Without the boolean 'controls' attribute, the browser hides the audio playback interface.",
  },
  {
    courseSlug: "html",
    topicName: "Video",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "Which attribute on a <video> tag specifies an image to be shown while the video is downloading or before play starts?",
    options: ["poster", "thumbnail", "preview", "splash"],
    correctAnswer: "poster",
    explanation: "The 'poster' attribute specifies an image URL displayed until the user plays or seeks the video.",
  },
  {
    courseSlug: "html",
    topicName: "HTML5",
    difficulty: "EASY",
    type: "mcq",
    question: "Which HTML5 element provides a native drawing canvas that can be manipulated via JavaScript bitmap operations?",
    options: ["<canvas>", "<svg>", "<paint>", "<graphic>"],
    correctAnswer: "<canvas>",
    explanation: "<canvas> provides a resolution-dependent bitmap canvas for dynamic 2D and WebGL rendering via JavaScript.",
  },
  {
    courseSlug: "html",
    topicName: "HTML Best Practices",
    difficulty: "MEDIUM",
    type: "mcq",
    question: "Why should the 'lang' attribute always be specified on the root <html> element (e.g., <html lang='en'>)?",
    options: [
      "It allows screen readers to pronounce words correctly and enables automatic search engine language translation",
      "It determines the server's database collation",
      "It controls the timezone of client-side Date objects",
      "It is required by CSS compilers to parse stylesheets",
    ],
    correctAnswer: "It allows screen readers to pronounce words correctly and enables automatic search engine language translation",
    explanation: "The lang attribute informs screen readers of the correct speech synthesis voice/pronunciation rules and assists SEO indexers.",
  },
];

async function main() {
  console.log("🚀 Starting rich question bank expansion (Part 2)...");

  const courses = await prisma.course.findMany();
  const courseMap = new Map(courses.map((c) => [c.slug, c.id]));

  let totalAdded = 0;

  for (const q of PART2_QUESTIONS) {
    const courseId = courseMap.get(q.courseSlug as any);
    if (!courseId) continue;

    const slug = slugify(q.topicName);
    const topic = await prisma.topic.upsert({
      where: { courseId_slug: { courseId, slug } },
      update: { name: q.topicName },
      create: { courseId, name: q.topicName, slug },
    });

    const existing = await prisma.question.findFirst({
      where: {
        courseId,
        topicId: topic.id,
        question: q.question,
      },
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          courseId,
          topicId: topic.id,
          difficulty: q.difficulty,
          type: q.type,
          question: q.question,
          code: (q as any).code || null,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          generationSource: "curriculum_engine",
        },
      });
      totalAdded++;
    }
  }

  console.log(`✅ Successfully seeded ${totalAdded} additional questions!`);
}

main()
  .catch((err) => {
    console.error("Error in part 2:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
