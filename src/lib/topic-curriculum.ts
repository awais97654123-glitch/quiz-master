/**
 * TOPIC CURRICULUM REGISTRY & CONCEPTUAL INTELLIGENCE SYSTEM
 * 
 * Provides deep contextual understanding for courses, topics, and subtopics:
 * - Precise academic definitions
 * - Core concepts to test
 * - Common learner misconceptions
 * - Explicitly OUT-OF-SCOPE concepts (Hard Topic Isolation)
 * - Curated, pre-verified topic questions ensuring zero cross-topic contamination
 */

export interface TopicContext {
  course: string;
  topic: string;
  definition: string;
  coreConcepts: string[];
  commonMisconceptions: string[];
  outOfScope: string[];
  keywords: string[];
}

export interface CurriculumVerifiedQuestion {
  question: string;
  code?: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subtopic: string;
}

export const TOPIC_CURRICULUM_REGISTRY: Record<string, Record<string, {
  context: TopicContext;
  questions: CurriculumVerifiedQuestion[];
}>> = {
  JavaScript: {
    Promises: {
      context: {
        course: "JavaScript",
        topic: "Promises",
        definition: "A Promise is an object representing the eventual completion or failure of an asynchronous operation and its resulting value.",
        coreConcepts: [
          "Promise states (pending, fulfilled, rejected)",
          ".then() chaining and return value wrapping",
          ".catch() error interception and recovery",
          ".finally() execution regardless of outcome",
          "Promise.all() fail-fast behavior and all-fulfilled resolution",
          "Promise.allSettled() tracking outcomes of all promises",
          "Promise.race() first settled wins",
          "Promise.any() first fulfilled wins (AggregateError on all rejected)",
          "Microtask queue execution order vs Macrotask",
          "Error bubbling and propagation down promise chains",
        ],
        commonMisconceptions: [
          "Believing the executor function passed to new Promise() runs asynchronously (it runs synchronously immediately)",
          "Assuming .then() handlers run synchronously once a promise is resolved (they are always queued as microtasks)",
          "Thinking Promise.all() waits for other promises after one rejects (it rejects immediately on the first error)",
          "Confusing Promise.race() with Promise.any() (race settles on first rejection OR fulfillment; any waits for first fulfillment)",
        ],
        outOfScope: [
          "CSS",
          "HTML DOM manipulation",
          "Unrelated array methods like Array.prototype.reduce",
          "HTML form validation",
          "Unrelated string manipulation",
          "CSS flexbox / styling",
        ],
        keywords: [
          "promise", "resolve", "reject", "then", "catch", "finally",
          "promise.all", "promise.race", "promise.allsettled", "promise.any",
          "fulfilled", "pending", "rejected", "microtask", "chaining",
        ],
      },
      questions: [
        {
          question: "When creating a new Promise instance via 'new Promise((resolve, reject) => { ... })', when does the executor callback execute?",
          code: "console.log('A');\nnew Promise((resolve) => {\n  console.log('B');\n  resolve();\n});\nconsole.log('C');",
          options: [
            "Synchronously and immediately during instantiation (Order: A, B, C)",
            "Asynchronously on the next microtask turn (Order: A, C, B)",
            "Asynchronously inside the macrotask event loop queue (Order: A, C, B)",
            "Only when .then() is attached to the promise instance",
          ],
          correctAnswer: "Synchronously and immediately during instantiation (Order: A, B, C)",
          explanation: "The executor function passed to the Promise constructor is executed immediately and synchronously when the promise is constructed. Output is A, then B, then C.",
          difficulty: "EASY",
          subtopic: "Promise Lifecycle",
        },
        {
          question: "What is the key behavioral difference between Promise.all() and Promise.allSettled() when one of the input promises rejects?",
          code: null,
          options: [
            "Promise.all() rejects immediately with that error (fail-fast), whereas Promise.allSettled() waits for all promises to finish and returns their individual statuses",
            "Promise.allSettled() rejects immediately, while Promise.all() ignores rejections and returns fulfilled values",
            "Promise.all() returns an AggregateError, whereas Promise.allSettled() throws an unhandled rejection",
            "Both methods reject immediately, but Promise.allSettled() provides a stack trace",
          ],
          correctAnswer: "Promise.all() rejects immediately with that error (fail-fast), whereas Promise.allSettled() waits for all promises to finish and returns their individual statuses",
          explanation: "Promise.all() is fail-fast: if any promise in the array rejects, the returned promise immediately rejects with that rejection reason. Promise.allSettled() always waits for every promise to settle (either fulfill or reject), returning an array of descriptor objects.",
          difficulty: "MEDIUM",
          subtopic: "Promise Combinators",
        },
        {
          question: "In a Promise chain, what happens to downstream .then() callbacks if an error is thrown inside a .then() handler and no immediate .catch() is attached?",
          code: "Promise.resolve(1)\n  .then(() => { throw new Error('Failed'); })\n  .then(() => console.log('Step 2'))\n  .catch((err) => console.log('Caught: ' + err.message));",
          options: [
            "Subsequent .then() callbacks are bypassed until the nearest .catch() handler is reached (Prints: Caught: Failed)",
            "The error is silently ignored and Step 2 executes with an undefined argument",
            "The entire Node or browser process crashes before reaching .catch()",
            "Step 2 executes, and then the error is logged afterwards",
          ],
          correctAnswer: "Subsequent .then() callbacks are bypassed until the nearest .catch() handler is reached (Prints: Caught: Failed)",
          explanation: "When an exception is thrown in a promise handler, the promise returned by that handler transitions to the rejected state. Downstream fulfillment handlers (.then) are skipped until a rejection handler (.catch) is encountered.",
          difficulty: "MEDIUM",
          subtopic: "Error Propagation",
        },
        {
          question: "What does Promise.any() do if every promise in the iterable is rejected?",
          code: "Promise.any([Promise.reject('E1'), Promise.reject('E2')])\n  .catch((err) => { /* What is err? */ });",
          options: [
            "It rejects with an AggregateError containing all individual rejection reasons in its 'errors' property",
            "It resolves with an array of null values",
            "It rejects with only the first rejection reason ('E1')",
            "It hangs indefinitely in a pending state",
          ],
          correctAnswer: "It rejects with an AggregateError containing all individual rejection reasons in its 'errors' property",
          explanation: "Promise.any() fulfills as soon as any promise in the iterable fulfills. If all input promises reject, it rejects with an AggregateError, which groups together all individual rejection reasons.",
          difficulty: "HARD",
          subtopic: "Promise.any & AggregateError",
        },
        {
          question: "What value does a .finally() callback receive as its argument, and what does returning a value inside .finally() do to the promise chain?",
          code: "Promise.resolve('Data')\n  .finally(() => 'Modified')\n  .then((res) => console.log(res));",
          options: [
            ".finally() receives no arguments, and its return value is ignored, preserving the original resolution ('Data')",
            ".finally() receives 'Data', and its return value replaces it with 'Modified'",
            ".finally() receives an error object, and returning 'Modified' converts the promise to pending",
            ".finally() causes a TypeError if a return statement is present",
          ],
          correctAnswer: ".finally() receives no arguments, and its return value is ignored, preserving the original resolution ('Data')",
          explanation: "A .finally() callback takes no parameters because it cannot know whether the promise was fulfilled or rejected. Unless .finally() returns a rejected promise or throws, its return value is ignored and the previous resolution value passes through.",
          difficulty: "HARD",
          subtopic: "Promise.prototype.finally",
        },
      ],
    },
    Functions: {
      context: {
        course: "JavaScript",
        topic: "Functions",
        definition: "Functions in JavaScript are first-class citizens: reusable blocks of executable code that can be passed as arguments, returned from other functions, and assigned to variables.",
        coreConcepts: [
          "Function declarations vs Function expressions",
          "Hoisting behavior with function declarations",
          "The 'arguments' object in traditional functions",
          "Default parameters and rest parameters (...args)",
          "First-class functions and Higher-Order Functions (callbacks, return values)",
          "Pure functions and side effects",
          "Recursion and call stack limits",
        ],
        commonMisconceptions: [
          "Believing function expressions are hoisted with their function body (only declarations are fully hoisted; expressions follow variable hoisting)",
          "Assuming default parameters evaluate at declaration time rather than call time (they evaluate each time the function is called if argument is undefined)",
          "Confusing rest parameters with the legacy 'arguments' object (rest parameters are true Array instances)",
        ],
        outOfScope: ["CSS", "HTML", "DOM APIs", "Promises", "Async/await", "SQL"],
        keywords: ["function", "return", "arguments", "hoisting", "rest parameter", "default parameter", "callback", "higher-order", "recursion"],
      },
      questions: [
        {
          question: "What occurs when invoking a function declaration before its definition in source code, compared to a function expression assigned to a 'const'?",
          code: "foo();\nfunction foo() { return 1; }\n\nbar();\nconst bar = function() { return 2; };",
          options: [
            "foo() succeeds due to function hoisting; bar() throws a ReferenceError (Cannot access 'bar' before initialization)",
            "Both function calls succeed without error",
            "foo() throws a ReferenceError; bar() returns 2",
            "Both function calls fail with TypeError",
          ],
          correctAnswer: "foo() succeeds due to function hoisting; bar() throws a ReferenceError (Cannot access 'bar' before initialization)",
          explanation: "Function declarations are hoisted along with their entire definition to the top of their scope. Function expressions assigned to let/const reside in the Temporal Dead Zone (TDZ) until evaluation.",
          difficulty: "MEDIUM",
          subtopic: "Function Hoisting",
        },
        {
          question: "What is the result when a function default parameter depends on another parameter defined to its left?",
          code: "function compute(a, b = a * 2) {\n  return a + b;\n}\nconsole.log(compute(5));",
          options: [
            "15 (a is 5, b defaults to 5 * 2 = 10)",
            "NaN (b cannot access a before invocation)",
            "ReferenceError: a is not defined",
            "5 (b defaults to 0)",
          ],
          correctAnswer: "15 (a is 5, b defaults to 5 * 2 = 10)",
          explanation: "Parameters are evaluated from left to right in their own scope. Later parameters can reference earlier parameters in their default expressions.",
          difficulty: "MEDIUM",
          subtopic: "Default Parameters",
        },
        {
          question: "How does the 'rest parameter' syntax (...args) differ from the legacy 'arguments' object?",
          code: null,
          options: [
            "Rest parameters produce a genuine Array instance with methods like .map() and .filter(), whereas 'arguments' is an array-like object",
            "Rest parameters cannot be used in arrow functions, whereas 'arguments' can",
            "The 'arguments' object includes only named parameters, while rest parameters include everything",
            "Rest parameters are evaluated synchronously while 'arguments' is asynchronous",
          ],
          correctAnswer: "Rest parameters produce a genuine Array instance with methods like .map() and .filter(), whereas 'arguments' is an array-like object",
          explanation: "The rest parameter (...args) collects remaining arguments into a real JavaScript Array with full prototype access (filter, map, reduce). The legacy 'arguments' object is merely array-like (has length and indexed elements, but no Array methods).",
          difficulty: "EASY",
          subtopic: "Rest Parameters vs Arguments",
        },
      ],
    },
    Variables: {
      context: {
        course: "JavaScript",
        topic: "Variables",
        definition: "Variables in JavaScript are named containers for storing data values, governed by scope rules (var vs let vs const) and the Temporal Dead Zone.",
        coreConcepts: [
          "var: function-scoped, re-declarable, hoisted with undefined",
          "let: block-scoped, re-assignable, Temporal Dead Zone (TDZ)",
          "const: block-scoped, immutable identifier binding, must be initialized",
          "Temporal Dead Zone (TDZ) mechanics",
          "Shadowing and lexical scoping of variables",
          "Object mutation vs variable reassignment with const",
        ],
        commonMisconceptions: [
          "Thinking 'const' makes an object's properties immutable (const only freezes the variable reference, not the object's contents)",
          "Assuming 'var' has block scope like in C++ or Java (var is function-scoped or global-scoped)",
          "Thinking variables declared with let are not hoisted (they ARE hoisted, but placed in the TDZ)",
        ],
        outOfScope: ["CSS", "HTML", "DOM", "Promises", "Async", "Event listeners"],
        keywords: ["var", "let", "const", "scope", "temporal dead zone", "tdz", "hoisting", "mutation", "reassignment"],
      },
      questions: [
        {
          question: "What happens when you modify a property of an object declared with 'const'?",
          code: "const user = { name: 'Alice' };\nuser.name = 'Bob';\nconsole.log(user.name);",
          options: [
            "It successfully logs 'Bob' because 'const' prevents reassignment of the variable binding, not mutation of the underlying object",
            "It throws a TypeError: Assignment to constant variable",
            "It fails silently in strict mode, leaving user.name as 'Alice'",
            "It creates a new cloned object in memory",
          ],
          correctAnswer: "It successfully logs 'Bob' because 'const' prevents reassignment of the variable binding, not mutation of the underlying object",
          explanation: "'const' creates an immutable binding to the memory address of the object, preventing reassignment (e.g., user = {}). However, properties within the referenced object can still be mutated freely unless frozen with Object.freeze().",
          difficulty: "EASY",
          subtopic: "const Mutation Semantics",
        },
        {
          question: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
          code: "console.log(x);\nlet x = 10;",
          options: [
            "The period between entering the enclosing block scope and the actual execution of the variable declaration, during which accessing it throws a ReferenceError",
            "The time a variable remains in memory before garbage collection",
            "The idle time of the event loop before timer callbacks execute",
            "A security sandbox where unverified variables cannot execute code",
          ],
          correctAnswer: "The period between entering the enclosing block scope and the actual execution of the variable declaration, during which accessing it throws a ReferenceError",
          explanation: "Variables declared with 'let' and 'const' are hoisted to the top of their block, but cannot be accessed until their declaration line is executed. Accessing them during this span triggers a ReferenceError.",
          difficulty: "MEDIUM",
          subtopic: "Temporal Dead Zone",
        },
      ],
    },
    Arrays: {
      context: {
        course: "JavaScript",
        topic: "Arrays",
        definition: "JavaScript Arrays are ordered, high-level list-like objects whose prototype provides methods for traversal, mutation, and functional transformation.",
        coreConcepts: [
          "Array indexing and .length property behavior",
          "Mutating methods: push, pop, shift, unshift, splice, sort, reverse",
          "Non-mutating methods: map, filter, reduce, slice, concat, flatMap",
          "Sparse arrays and holes vs undefined elements",
          "Array destructuring and spread syntax",
        ],
        commonMisconceptions: [
          "Thinking .slice() mutates the array (slice returns a shallow copy; splice mutates)",
          "Assuming arr.sort() sorts numbers in ascending numeric order by default (it converts elements to strings and sorts lexicographically)",
        ],
        outOfScope: ["CSS", "HTML", "DOM", "Promises", "Async"],
        keywords: ["array", "push", "pop", "splice", "slice", "map", "filter", "reduce", "sort", "length", "destructuring"],
      },
      questions: [
        {
          question: "What is the output when sorting an array of numbers using arr.sort() without a comparator function?",
          code: "const nums = [10, 5, 20, 1];\nnums.sort();\nconsole.log(nums);",
          options: [
            "[1, 10, 20, 5] (lexicographical string sorting)",
            "[1, 5, 10, 20] (numerical ascending order)",
            "[20, 10, 5, 1] (numerical descending order)",
            "TypeError: numeric comparator required",
          ],
          correctAnswer: "[1, 10, 20, 5] (lexicographical string sorting)",
          explanation: "Array.prototype.sort() casts array elements to strings by default and compares their UTF-16 code unit values. Hence '10' comes before '5'. Numerical sorting requires (a, b) => a - b.",
          difficulty: "MEDIUM",
          subtopic: "Array Sorting",
        },
      ],
    },
  },
  CSS: {
    Flexbox: {
      context: {
        course: "CSS",
        topic: "Flexbox",
        definition: "CSS Flexible Box Layout (Flexbox) is a one-dimensional layout model designed to distribute space along a main axis and cross axis.",
        coreConcepts: [
          "Main axis vs Cross axis",
          "flex-direction (row, row-reverse, column, column-reverse)",
          "justify-content (aligns along main axis)",
          "align-items and align-self (aligns along cross axis)",
          "flex shorthand: flex-grow, flex-shrink, flex-basis",
          "flex-wrap and align-content (multi-line flex containers)",
          "gap property in flex containers",
        ],
        commonMisconceptions: [
          "Confusing justify-content and align-items (justify-content is ALWAYS along main axis; align-items is ALWAYS along cross axis)",
          "Assuming flex: 1 means flex-basis is auto (flex: 1 sets flex-basis to 0% or 0px, whereas flex: auto sets flex-basis to auto)",
        ],
        outOfScope: ["HTML tags", "JavaScript syntax", "CSS Grid template areas", "Promises", "SQL"],
        keywords: ["flexbox", "display: flex", "justify-content", "align-items", "flex-direction", "flex-grow", "flex-shrink", "flex-basis", "main axis", "cross axis"],
      },
      questions: [
        {
          question: "In CSS Flexbox, if flex-direction is set to 'column', which property controls alignment along the horizontal axis?",
          code: ".container {\n  display: flex;\n  flex-direction: column;\n  /* Which property centers horizontally? */\n}",
          options: [
            "align-items: center (because horizontal is now the cross axis)",
            "justify-content: center (because horizontal is always justify-content)",
            "text-align: center",
            "align-content: center",
          ],
          correctAnswer: "align-items: center (because horizontal is now the cross axis)",
          explanation: "When flex-direction is 'column', the main axis runs vertically (top-to-bottom) and the cross axis runs horizontally (left-to-right). align-items controls the cross axis (horizontal).",
          difficulty: "MEDIUM",
          subtopic: "Flex Axes & Alignment",
        },
        {
          question: "What do the three values in the shorthand 'flex: 2 1 200px;' represent in CSS Flexbox?",
          code: ".item { flex: 2 1 200px; }",
          options: [
            "flex-grow: 2, flex-shrink: 1, flex-basis: 200px",
            "flex-shrink: 2, flex-grow: 1, flex-basis: 200px",
            "flex-basis: 2px, flex-grow: 1, flex-shrink: 200px",
            "flex-order: 2, flex-wrap: 1, flex-basis: 200px",
          ],
          correctAnswer: "flex-grow: 2, flex-shrink: 1, flex-basis: 200px",
          explanation: "The flex shorthand order is strictly: flex-grow, flex-shrink, and flex-basis.",
          difficulty: "EASY",
          subtopic: "Flex Shorthand",
        },
      ],
    },
    Specificity: {
      context: {
        course: "CSS",
        topic: "Specificity",
        definition: "CSS Specificity is the algorithm browsers use to determine which style rule applies to an element when multiple conflicting rules match.",
        coreConcepts: [
          "Specificity weights: Inline styles (1,0,0,0), IDs (0,1,0,0), Classes/Attributes/Pseudo-classes (0,0,1,0), Elements/Pseudo-elements (0,0,0,1)",
          "!important override rule",
          "Universal selector (*) and combinators (+, >, ~) having 0 specificity",
          ":is() and :not() specificity calculation rules",
          "Cascade order when specificities are equal (source order wins)",
        ],
        commonMisconceptions: [
          "Believing 11 classes can override 1 ID (specificity values in different tiers do not carry over or overflow)",
          "Thinking universal selector (*) adds specificity (it has (0, 0, 0, 0))",
        ],
        outOfScope: ["HTML tags", "JavaScript Promises", "CSS flex-grow", "DOM APIs"],
        keywords: ["specificity", "cascade", "!important", "id selector", "class selector", "element selector", "pseudo-class"],
      },
      questions: [
        {
          question: "Which of the following CSS selectors has the highest specificity score?",
          code: "A: #nav .menu-item a\nB: nav.main ul.menu li.menu-item a.link\nC: #nav #menu a\nD: header nav .menu-item",
          options: [
            "Selector C (#nav #menu a) with 2 IDs and 1 element (2, 0, 1)",
            "Selector B with 4 classes and 3 elements (0, 4, 3)",
            "Selector A with 1 ID, 1 class, 1 element (1, 1, 1)",
            "Selector D with 1 class and 2 elements (0, 1, 2)",
          ],
          correctAnswer: "Selector C (#nav #menu a) with 2 IDs and 1 element (2, 0, 1)",
          explanation: "ID selectors carry a weight of (0, 1, 0, 0). Selector C has 2 IDs (0, 2, 0, 1), which surpasses Selector A (0, 1, 1, 1) and Selector B (0, 0, 4, 3). ID counts always beat class counts regardless of quantity.",
          difficulty: "HARD",
          subtopic: "Specificity Calculation",
        },
      ],
    },
  },
  HTML: {
    "Semantic HTML": {
      context: {
        course: "HTML",
        topic: "Semantic HTML",
        definition: "Semantic HTML introduces meaning to the web page rather than just presentation, conveying the role and structure of content to browsers, search engines, and screen readers.",
        coreConcepts: [
          "<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>",
          "<article> (standalone, syndicatable) vs <section> (thematic grouping with heading)",
          "Accessibility benefits of landmark regions",
          "Avoiding non-semantic <div> and <span> soup",
          "<figure> and <figcaption> for self-contained media",
          "<time> element for machine-readable dates",
        ],
        commonMisconceptions: [
          "Using <section> purely as a styling container (use <div> for generic styling wrappers)",
          "Thinking <header> and <footer> can only appear once per page (they can appear inside <article> and <section> as well)",
        ],
        outOfScope: ["CSS Flexbox", "JavaScript Promises", "SQL", "Database queries"],
        keywords: ["semantic", "article", "section", "header", "footer", "nav", "aside", "main", "landmark", "accessibility"],
      },
      questions: [
        {
          question: "When should an <article> element be chosen instead of a <section> element in HTML5?",
          code: null,
          options: [
            "When the content represents an independent, self-contained composition that could be syndicated or reused on another site",
            "When the content is located in the sidebar of the page",
            "When the container only contains images and no headings",
            "When the element needs flexbox layout properties",
          ],
          correctAnswer: "When the content represents an independent, self-contained composition that could be syndicated or reused on another site",
          explanation: "<article> is specifically designed for self-contained, distributable compositions (e.g. blog post, product card, news item). <section> is for a thematic grouping of content, typically with a heading.",
          difficulty: "MEDIUM",
          subtopic: "Article vs Section",
        },
      ],
    },
  },
};

/**
 * Normalizes text for comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns topic curriculum context. If not pre-registered, dynamically derives a strict topic context.
 */
export function getTopicContext(courseName: string, topicName: string): TopicContext {
  const courseMatch = Object.keys(TOPIC_CURRICULUM_REGISTRY).find(
    (c) => c.toLowerCase() === courseName.toLowerCase()
  );

  if (courseMatch) {
    const topicMatch = Object.keys(TOPIC_CURRICULUM_REGISTRY[courseMatch]).find(
      (t) => t.toLowerCase() === topicName.toLowerCase()
    );
    if (topicMatch) {
      return TOPIC_CURRICULUM_REGISTRY[courseMatch][topicMatch].context;
    }
  }

  // Synthesize strong contextual boundaries for unregistered topics
  return {
    course: courseName,
    topic: topicName,
    definition: `${topicName} within ${courseName} programming curriculum.`,
    coreConcepts: [
      `${topicName} syntax and lifecycle`,
      `Core use cases and patterns in ${topicName}`,
      `Common errors, edge cases, and best practices in ${topicName}`,
    ],
    commonMisconceptions: [
      `Confusing ${topicName} behavior with unrelated features`,
      `Misunderstanding the execution timing and state management of ${topicName}`,
    ],
    outOfScope: [
      "Unrelated languages or frameworks",
      "Generic syntax that does not require knowledge of " + topicName,
      "Concepts from other separate course topics",
    ],
    keywords: [
      ...topicName.toLowerCase().split(/\s+/),
      courseName.toLowerCase(),
    ],
  };
}

/**
 * Alias for getTopicContext
 */
export const getTopicCurriculum = getTopicContext;

/**
 * HARD TOPIC ISOLATION CHECK:
 * Evaluates whether a question is strictly relevant to the given topic, rejecting cross-topic contamination.
 */
export function isQuestionRelevantToTopic(
  questionText: string,
  options: string[],
  explanation: string,
  topicName: string,
  courseName: string
): { isRelevant: boolean; reason: string; qualityScore: number } {
  const fullContent = `${questionText} ${options.join(" ")} ${explanation}`.toLowerCase();
  const context = getTopicContext(courseName, topicName);

  // 1. Check for explicit out-of-scope violations
  for (const outOfScope of context.outOfScope) {
    const outNorm = outOfScope.toLowerCase();
    // Only check if it's a specific forbidden term, not generic phrasing
    if (outNorm.length > 3 && fullContent.includes(outNorm)) {
      // If the question is explicitly dominated by an out-of-scope technology (e.g. asking about CSS Flexbox when topic is JS Promises)
      return {
        isRelevant: false,
        reason: `Violates topic isolation: Question contains out-of-scope concept '${outOfScope}' for topic '${topicName}'.`,
        qualityScore: 20,
      };
    }
  }

  // 2. Cross-Course Pollution Check
  const courseNorm = courseName.toLowerCase();
  if (courseNorm === "javascript" && (fullContent.includes("<!doctype") || fullContent.includes("<meta charset") || fullContent.includes("css selector"))) {
    return {
      isRelevant: false,
      reason: `Course mismatch: JavaScript topic '${topicName}' contains HTML/CSS specific declarations.`,
      qualityScore: 10,
    };
  }
  if (courseNorm === "css" && (fullContent.includes("promise.resolve") || fullContent.includes("async/await") || fullContent.includes("addeventlistener"))) {
    return {
      isRelevant: false,
      reason: `Course mismatch: CSS topic '${topicName}' contains JavaScript asynchronous runtime code.`,
      qualityScore: 10,
    };
  }

  // 3. Topic Keyword Density / Relevance Check
  const topicTokens = topicName.toLowerCase().split(/[\s/_-]+/).filter((t) => t.length > 2);
  const foundTokens = topicTokens.filter((token) => fullContent.includes(token));

  const hasDirectTopicMention = foundTokens.length > 0;
  const hasKeywordMatch = context.keywords.some((kw) => fullContent.includes(kw.toLowerCase()));

  if (!hasDirectTopicMention && !hasKeywordMatch) {
    return {
      isRelevant: false,
      reason: `Lack of topic specificity: Question does not reference core concepts or vocabulary of '${topicName}'.`,
      qualityScore: 40,
    };
  }

  // Calculate quality score based on explanation depth and option plausibility
  let quality = 85;
  if (explanation.length > 60) quality += 5;
  if (questionText.includes("why") || questionText.includes("behavior") || questionText.includes("what is the output") || questionText.includes("difference")) {
    quality += 5; // Conceptual reasoning bonus
  }

  return {
    isRelevant: true,
    reason: `Question directly tests core concepts of ${topicName}.`,
    qualityScore: Math.min(100, quality),
  };
}

/**
 * Get verified fallback questions strictly for this topic.
 * Guarantees zero cross-topic contamination.
 */
export function getVerifiedCurriculumQuestions(
  courseName: string,
  topicName: string,
  count: number = 20
): CurriculumVerifiedQuestion[] {
  const courseMatch = Object.keys(TOPIC_CURRICULUM_REGISTRY).find(
    (c) => c.toLowerCase() === courseName.toLowerCase()
  );

  if (courseMatch) {
    const topicMatch = Object.keys(TOPIC_CURRICULUM_REGISTRY[courseMatch]).find(
      (t) => t.toLowerCase() === topicName.toLowerCase()
    );
    if (topicMatch) {
      const bank = TOPIC_CURRICULUM_REGISTRY[courseMatch][topicMatch].questions;
      if (bank && bank.length > 0) {
        return bank.slice(0, count);
      }
    }
  }

  return [];
}
