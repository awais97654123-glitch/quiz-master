import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export const QuestionSchema = z.object({
  course: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "EASY", "MEDIUM", "HARD"]).transform((val) => val.toUpperCase() as "EASY" | "MEDIUM" | "HARD"),
  type: z.literal("mcq").default("mcq"),
  question: z.string().min(10, "Question must be at least 10 characters long"),
  code: z.string().nullable().optional(),
  options: z
    .array(z.string().min(1))
    .length(4, "Question must contain exactly 4 options")
    .refine((items) => new Set(items).size === 4, {
      message: "All 4 options must be distinct",
    }),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(15, "Explanation must be detailed and at least 15 characters"),
}).refine((data) => data.options.includes(data.correctAnswer), {
  message: "Correct answer must exactly match one of the four options",
  path: ["correctAnswer"],
});

export type GeneratedQuestion = z.infer<typeof QuestionSchema>;

/**
 * Generate questions via Google Gemini API
 */
export async function generateQuestionsWithGemini(
  course: string,
  topic: string,
  difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM",
  count: number = 3
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    // If no API key configured, use our internal verified curriculum fallback generator
    return generateCurriculumFallbackQuestions(course, topic, difficulty, count);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const prompt = `
You are an expert exam designer and technical educator in web development.
Generate ${count} high-quality, educationally rigorous multiple choice questions for:
- Course: ${course}
- Topic: ${topic}
- Difficulty: ${difficulty}

Style variety:
Mix conceptual questions, code snippet analysis, output prediction, and debugging scenarios.
Ensure the code snippet (if provided) is syntactically accurate.

Return a JSON array of objects adhering strictly to this schema:
[
  {
    "course": "${course}",
    "topic": "${topic}",
    "difficulty": "${difficulty.toLowerCase()}",
    "type": "mcq",
    "question": "Clear, unambiguous question text",
    "code": "Optional code snippet or null",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact string of the correct option",
    "explanation": "Clear academic explanation of why this answer is correct and why others are wrong."
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const rawData = JSON.parse(text);

    const questionsArray = Array.isArray(rawData) ? rawData : [rawData];
    const validatedQuestions: GeneratedQuestion[] = [];

    for (const item of questionsArray) {
      const parsed = QuestionSchema.safeParse(item);
      if (parsed.success) {
        validatedQuestions.push(parsed.data);
      } else {
        console.warn("Rejected invalid generated question:", parsed.error.format());
      }
    }

    if (validatedQuestions.length === 0) {
      return generateCurriculumFallbackQuestions(course, topic, difficulty, count);
    }

    return validatedQuestions;
  } catch (error) {
    console.error("Gemini question generation error, using curriculum fallback:", error);
    return generateCurriculumFallbackQuestions(course, topic, difficulty, count);
  }
}

/**
 * Verified curriculum fallback generator providing guaranteed valid, academically accurate questions
 */
export function generateCurriculumFallbackQuestions(
  course: string,
  topic: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  count: number
): GeneratedQuestion[] {
  const pool: Record<string, GeneratedQuestion[]> = {
    HTML: [
      {
        course: "HTML",
        topic: "Semantic HTML",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "Which HTML5 semantic element is intended to encapsulate an independent, self-contained composition that could be distributed or reusable?",
        code: null,
        options: ["<article>", "<section>", "<aside>", "<div>"],
        correctAnswer: "<article>",
        explanation: "The <article> element represents a self-contained composition in a document, page, or application, which is independently distributable or reusable (e.g., in syndication).",
      },
      {
        course: "HTML",
        topic: "Forms Validation",
        difficulty: "HARD",
        type: "mcq",
        question: "What does the 'pattern' attribute on an HTML <input> element expect as its value?",
        code: '<input type="text" pattern="[A-Za-z]{3}" name="code">',
        options: [
          "A regular expression that the control's value must match",
          "A glob pattern specifying acceptable file extensions",
          "A CSS selector defining formatting rules",
          "A JavaScript function name for validation",
        ],
        correctAnswer: "A regular expression that the control's value must match",
        explanation: "The pattern attribute specifies a regular expression that the input's value must match for the form to be valid.",
      },
      {
        course: "HTML",
        topic: "Meta Tags",
        difficulty: "EASY",
        type: "mcq",
        question: "What is the primary function of the following viewport meta tag in responsive web design?",
        code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        options: [
          "It matches screen width in device-independent pixels and sets the initial zoom level to 1.0",
          "It forces high-definition rendering on Retina displays only",
          "It disables zooming completely for mobile users",
          "It preloads responsive CSS stylesheets",
        ],
        correctAnswer: "It matches screen width in device-independent pixels and sets the initial zoom level to 1.0",
        explanation: "width=device-width sets the width of the page to follow the screen-width of the device, and initial-scale=1.0 sets the initial zoom level when first loaded by the browser.",
      },
      {
        course: "HTML",
        topic: "Document Structure",
        difficulty: "EASY",
        type: "mcq",
        question: "What is the primary purpose of the '<!DOCTYPE html>' declaration at the beginning of an HTML file?",
        code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>...",
        options: [
          "It instructs the browser to render the page in standard mode rather than quirks mode",
          "It links the document to the W3C online validator",
          "It loads the HTML5 JavaScript runtime engine",
          "It defines the root element tag namespace",
        ],
        correctAnswer: "It instructs the browser to render the page in standard mode rather than quirks mode",
        explanation: "The <!DOCTYPE html> declaration informs web browsers that the document is written in modern HTML5, ensuring rendering in strict standards mode.",
      },
      {
        course: "HTML",
        topic: "Script Loading",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "When using the 'defer' attribute on a script tag, when does execution occur?",
        code: '<script defer src="app.js"></script>',
        options: [
          "After the HTML document has been fully parsed, just before DOMContentLoaded fires",
          "Immediately when downloaded, pausing HTML parsing synchronously",
          "Only after all stylesheets, images, and subresources finish downloading",
          "Concurrently in a background web worker thread",
        ],
        correctAnswer: "After the HTML document has been fully parsed, just before DOMContentLoaded fires",
        explanation: "Scripts with 'defer' download in parallel with HTML parsing but execute sequentially only after document parsing is complete, before DOMContentLoaded.",
      },
    ],
    CSS: [
      {
        course: "CSS",
        topic: "Flexbox",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "In CSS Flexbox, what does the shorthand property 'flex: 1 1 auto;' specify in terms of flex-grow, flex-shrink, and flex-basis?",
        code: ".card { flex: 1 1 auto; }",
        options: [
          "flex-grow: 1, flex-shrink: 1, flex-basis: auto",
          "flex-grow: 1, flex-shrink: 0, flex-basis: auto",
          "flex-grow: 0, flex-shrink: 1, flex-basis: 100%",
          "flex-grow: 1, flex-shrink: 1, flex-basis: 0px",
        ],
        correctAnswer: "flex-grow: 1, flex-shrink: 1, flex-basis: auto",
        explanation: "The flex shorthand takes up to three values: flex-grow, flex-shrink, and flex-basis, in that specific order.",
      },
      {
        course: "CSS",
        topic: "Specificity",
        difficulty: "HARD",
        type: "mcq",
        question: "Between the following CSS selectors, which one has the highest specificity?",
        code: "A: #header nav .item\nB: nav.main ul li.active\nC: #header #nav-container a\nD: [data-role='admin'] .user-list li",
        options: [
          "Selector C (#header #nav-container a)",
          "Selector A (#header nav .item)",
          "Selector B (nav.main ul li.active)",
          "Selector D ([data-role='admin'] .user-list li)",
        ],
        correctAnswer: "Selector C (#header #nav-container a)",
        explanation: "Specificity is calculated as (ID, Class/Attribute/Pseudo-class, Element). Selector C has 2 IDs, 0 classes, 1 element (2, 0, 1), beating Selector A (1, 1, 1).",
      },
      {
        course: "CSS",
        topic: "Grid",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "What layout does the following CSS Grid definition create?",
        code: ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n}",
        options: [
          "A responsive grid with columns at least 250px wide, wrapping automatically without media queries",
          "A fixed 4-column layout regardless of screen size",
          "A grid where all items shrink to 0 when screen is narrower than 250px",
          "A vertical column stack with fixed heights",
        ],
        correctAnswer: "A responsive grid with columns at least 250px wide, wrapping automatically without media queries",
        explanation: "repeat(auto-fit, minmax(250px, 1fr)) creates as many 250px+ tracks as will fit into the container, dynamically expanding to fill extra space.",
      },
      {
        course: "CSS",
        topic: "Box Model",
        difficulty: "EASY",
        type: "mcq",
        question: "Given 'box-sizing: border-box', what is the total rendered width of an element with 'width: 200px', 'padding: 20px', and 'border: 2px solid black'?",
        code: ".box {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 2px solid black;\n}",
        options: [
          "200px",
          "244px",
          "156px",
          "240px",
        ],
        correctAnswer: "200px",
        explanation: "With box-sizing: border-box, padding and border are included inside the specified width. The outer rendered width remains exactly 200px.",
      },
      {
        course: "CSS",
        topic: "Stacking Context",
        difficulty: "HARD",
        type: "mcq",
        question: "Which CSS declaration creates a brand new stacking context without requiring 'z-index'?",
        code: null,
        options: [
          "opacity: 0.95",
          "display: inline-block",
          "margin: 0 auto",
          "color: rgba(0, 0, 0, 0.8)",
        ],
        correctAnswer: "opacity: 0.95",
        explanation: "An opacity value less than 1 creates a new stacking context on the element, affecting how z-index behaves for its children.",
      },
    ],
    JavaScript: [
      {
        course: "JavaScript",
        topic: "Closures",
        difficulty: "HARD",
        type: "mcq",
        question: "What will be logged to the console when the following code runs?",
        code: "function createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\nconst c1 = createCounter();\nconst c2 = createCounter();\nc1();\nconsole.log(c1(), c2());",
        options: ["2 1", "2 2", "1 1", "3 1"],
        correctAnswer: "2 1",
        explanation: "Each invocation of createCounter creates a distinct lexical environment. c1 has its own count variable incremented twice (1, then 2). c2 has its own separate count incremented once (1).",
      },
      {
        course: "JavaScript",
        topic: "Promises",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "What is the output of the following asynchronous code snippet?",
        code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
        options: ["1, 4, 3, 2", "1, 2, 3, 4", "1, 3, 4, 2", "1, 4, 2, 3"],
        correctAnswer: "1, 4, 3, 2",
        explanation: "Synchronous code runs first (1, 4). Microtasks (Promise.then callbacks) execute immediately after the call stack clears (3). Macrotasks (setTimeout callbacks) run in the subsequent event loop tick (2).",
      },
      {
        course: "JavaScript",
        topic: "Array Methods",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "What is returned by the following reduce operation?",
        code: "const items = [1, 2, 3, 4];\nconst result = items.reduce((acc, curr) => acc + curr, 10);",
        options: ["20", "10", "24", "14"],
        correctAnswer: "20",
        explanation: "The initial value of acc is 10. Iterations: 10+1=11, 11+2=13, 13+3=16, 16+4=20. Final result is 20.",
      },
      {
        course: "JavaScript",
        topic: "Event Handling",
        difficulty: "EASY",
        type: "mcq",
        question: "Which method prevents an event from propagating (bubbling) further up the DOM hierarchy?",
        code: "button.addEventListener('click', (e) => {\n  // What stops bubbling here?\n});",
        options: [
          "event.stopPropagation()",
          "event.preventDefault()",
          "event.stopImmediate()",
          "event.cancelBubble = false",
        ],
        correctAnswer: "event.stopPropagation()",
        explanation: "stopPropagation() prevents further propagation of the current event in the capturing and bubbling phases.",
      },
      {
        course: "JavaScript",
        topic: "Type Coercion",
        difficulty: "HARD",
        type: "mcq",
        question: "What does the expression '[] == false' evaluate to in JavaScript, and why?",
        code: "console.log([] == false);",
        options: [
          "true, because [] is coerced to an empty string '', which is coerced to 0, matching false (0)",
          "false, because an array is a truthy object reference",
          "TypeError, because arrays cannot be compared to booleans with loose equality",
          "undefined, because type coercion fails on empty data structures",
        ],
        correctAnswer: "true, because [] is coerced to an empty string '', which is coerced to 0, matching false (0)",
        explanation: "Loose equality (==) coerces boolean false to 0, then calls ToPrimitive on [], yielding ''. The empty string is coerced to number 0, so 0 == 0 is true.",
      },
    ],
  };

  const courseList = pool[course] || pool["JavaScript"];
  const matching = courseList.filter(
    (q) => q.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(q.topic.toLowerCase())
  );

  const selected = matching.length > 0 ? matching : courseList;
  const results: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const item = selected[i % selected.length];
    results.push({
      ...item,
      course,
      topic,
      difficulty,
    });
  }
  return results;
}
