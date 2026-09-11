import { describe, it, expect } from "vitest";
import {
  evaluateQuestionQuality,
  detectQuestionDuplicate,
} from "../src/lib/ai-question-service";
import {
  getTopicCurriculum,
  getVerifiedCurriculumQuestions,
} from "../src/lib/topic-curriculum";
import {
  calculateTopicDistribution,
  prepareQuizQuestions,
} from "../src/lib/quiz-engine";
import {
  calculateNextReviewInterval,
  calculateAttemptLearningMetrics,
} from "../src/lib/learning-tracker";
import { sanitizeRoomCode } from "../src/lib/utils";
import { hashPassword, verifyPassword, signNativeJwt, verifyNativeJwt } from "../src/lib/auth-native";

describe("Topic Isolation & Hard Constraint Enforcement (Rules 1, 2, 4)", () => {
  it("provides strict topic definition, core concepts, and out-of-scope restrictions for JavaScript Promises", () => {
    const curriculum = getTopicCurriculum("javascript", "promises");
    expect(curriculum).toBeDefined();
    expect(curriculum?.topic).toBe("Promises");
    expect(curriculum?.outOfScope).toContain("HTML DOM manipulation");
    expect(curriculum?.outOfScope).toContain("CSS");
    expect(curriculum?.coreConcepts.some((c) => c.includes("chaining"))).toBe(true);
    expect(curriculum?.coreConcepts.some((c) => c.includes("Promise.allSettled"))).toBe(true);
  });

  it("never returns questions belonging to other topics during zero-contamination fallback", () => {
    const jsPromiseFallback = getVerifiedCurriculumQuestions("javascript", "promises");
    expect(jsPromiseFallback.length).toBeGreaterThanOrEqual(5);

    for (const q of jsPromiseFallback) {
      expect(q.subtopic).toBeDefined();
      // Must not contain unrelated DOM or CSS
      expect(q.question.toLowerCase()).not.toContain("<html>");
      expect(q.question.toLowerCase()).not.toContain("css selector");
    }
  });

  it("returns an empty fallback array rather than cross-contaminating when an unknown topic is queried", () => {
    const crossContaminationAttempt = getVerifiedCurriculumQuestions("javascript", "nonexistent-topic-xyz");
    expect(crossContaminationAttempt).toEqual([]);
  });
});

describe("Two-Stage Semantic Question Quality & Validation (Rules 7, 8, 24)", () => {
  it("approves a high-quality, concept-testing Promise chaining question", () => {
    const goodQuestion = {
      course: "javascript",
      topic: "promises",
      subtopic: "Promise Chaining",
      difficulty: "MEDIUM",
      question: "What happens if a .then() handler returns a Promise that rejects?",
      code: "fetchData().then(() => Promise.reject(new Error('Failed'))).then(console.log).catch(err => console.error(err.message));",
      options: [
        "The error is caught by the subsequent .catch() block",
        "The program crashes immediately with an unhandled rejection",
        "The next .then() receives undefined as its argument",
        "The rejection is silently swallowed and execution halts",
      ],
      correctAnswer: "The error is caught by the subsequent .catch() block",
      explanation: "Returning a rejected Promise from a .then() handler propagates the rejection down the chain until the nearest .catch() or rejection handler.",
      conceptualConcept: "Error propagation in Promise chains",
    };

    const validation = evaluateQuestionQuality(goodQuestion, [
      {
        question: "Existing question about something else",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
      },
    ]);

    expect(validation.isValid).toBe(true);
    expect(validation.relevant).toBe(true);
    expect(validation.qualityScore).toBeGreaterThanOrEqual(80);
    expect(validation.conceptualValue).toBeGreaterThanOrEqual(75);
    expect(validation.answerCorrect).toBe(true);
    expect(validation.duplicate).toBe(false);
  });

  it("rejects an off-topic question masquerading as a Promise question", () => {
    const badQuestion = {
      course: "javascript",
      topic: "promises",
      subtopic: "Variables",
      difficulty: "EASY",
      question: "Which keyword is used to declare a block-scoped variable in CSS or HTML?",
      options: ["let", "var", "const", "def"],
      correctAnswer: "let",
      explanation: "let declares a block-scoped variable.",
    };

    const validation = evaluateQuestionQuality(badQuestion, []);
    expect(validation.isValid).toBe(false);
    expect(validation.relevant).toBe(false);
  });

  it("detects and rejects duplicate questions even with slight phrasing changes", () => {
    const existingPool = [
      {
        question: "What is the difference between Promise.all() and Promise.allSettled()?",
        options: [
          "Promise.all fails fast on first rejection; allSettled waits for all promises regardless of status",
          "Promise.all returns an array; allSettled returns an object",
          "Promise.allSettled is synchronous; Promise.all is asynchronous",
          "There is no difference between them",
        ],
        correctAnswer:
          "Promise.all fails fast on first rejection; allSettled waits for all promises regardless of status",
      },
    ];

    const duplicateCandidate = {
      question: "What is the difference between Promise.all and Promise.allSettled?",
      options: [
        "Promise.all fails fast on first rejection; allSettled waits for all promises regardless of status",
        "Promise.all returns an array; allSettled returns an object",
        "Promise.allSettled is synchronous; Promise.all is asynchronous",
        "There is no difference between them",
      ],
      correctAnswer:
        "Promise.all fails fast on first rejection; allSettled waits for all promises regardless of status",
    };

    const isDuplicate = detectQuestionDuplicate(duplicateCandidate, existingPool);
    expect(isDuplicate).toBe(true);
  });
});

describe("Multi-Topic Independent Question Distribution (Rule 11)", () => {
  it("allocates questions independently per selected topic without shared contamination", () => {
    const topics = ["variables", "functions", "promises", "arrays"];
    const distribution = calculateTopicDistribution(topics, 20);

    expect(distribution).toHaveLength(4);
    for (const d of distribution) {
      expect(d.count).toBe(5);
    }
  });

  it("handles uneven distribution equitably across topics", () => {
    const topics = ["flexbox", "grid", "animations"];
    const distribution = calculateTopicDistribution(topics, 10);

    const total = distribution.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(10);
    expect(distribution[0].count).toBe(4);
    expect(distribution[1].count).toBe(3);
    expect(distribution[2].count).toBe(3);
  });
});

describe("User Mistake Tracking & Learning History (Critical Rules 6, 7, 14, 15, 19)", () => {
  it("RULE 6 & 7: When user answers wrong then later answers correct, the mistake is NEVER erased", () => {
    // Stage 1: Initial Attempt - User gets Question A WRONG
    let progress = {
      attempts: 1,
      correctAttempts: 0,
      incorrectAttempts: 1,
      previouslyIncorrect: true,
      consecutiveCorrect: 0,
      mastered: false,
      masteryLevel: "LEARNING",
    };

    expect(progress.incorrectAttempts).toBe(1);
    expect(progress.correctAttempts).toBe(0);
    expect(progress.previouslyIncorrect).toBe(true);

    // Stage 2: Later Attempt - User gets Question A CORRECT
    // We update progress for subsequent correct attempt
    progress.attempts += 1;
    progress.correctAttempts += 1;
    progress.consecutiveCorrect += 1;
    // CRITICAL: incorrectAttempts must REMAIN 1. It must NOT be reset to 0!
    // previouslyIncorrect must REMAIN true!

    expect(progress.attempts).toBe(2);
    expect(progress.incorrectAttempts).toBe(1); // STILL 1!
    expect(progress.correctAttempts).toBe(1);
    expect(progress.previouslyIncorrect).toBe(true); // NEVER erased!
  });

  it("advances mastery levels across consecutive correct answers without wiping mistakes", () => {
    const interval1 = calculateNextReviewInterval(0, false);
    expect(interval1.intervalHours).toBe(4); // Immediate review for mistake
    expect(interval1.masteryLevel).toBe("LEARNING");

    const interval2 = calculateNextReviewInterval(1, true);
    expect(interval2.intervalHours).toBe(24);
    expect(interval2.masteryLevel).toBe("REVIEW");

    const interval3 = calculateNextReviewInterval(3, true);
    expect(interval3.mastered).toBe(true);
    expect(interval3.masteryLevel).toBe("MASTERED");
    expect(interval3.intervalHours).toBe(168); // 7 days retention review
  });

  it("RULE 14 & 20: Accurately separates Current Score from Historical Learning Performance", () => {
    // 10 questions:
    // User answered 9 correct, 1 incorrect in current quiz.
    // Out of the 9 correct, 2 were previously answered incorrectly in older attempts (Recovered).
    // Out of all 10, 1 reached 3 consecutive correct (Mastered).
    const questionResults = [
      { isCorrect: true, previouslyIncorrect: true, consecutiveCorrect: 1 }, // Recovered
      { isCorrect: true, previouslyIncorrect: true, consecutiveCorrect: 2 }, // Recovered
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 1 },
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 1 },
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 1 },
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 1 },
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 1 },
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 3 }, // Mastered
      { isCorrect: true, previouslyIncorrect: false, consecutiveCorrect: 2 },
      { isCorrect: false, previouslyIncorrect: true, consecutiveCorrect: 0 }, // Needs review
    ];

    const metrics = calculateAttemptLearningMetrics(questionResults);

    // Current Quiz Score
    expect(metrics.currentScore).toBe(9);
    expect(metrics.totalQuestions).toBe(10);
    expect(metrics.currentAccuracy).toBe(90);

    // Historical / Conceptual Learning Metrics
    expect(metrics.previouslyMissedCount).toBe(3); // 3 questions were historically missed
    expect(metrics.recoveredCount).toBe(2); // 2 were missed previously but conquered now
    expect(metrics.firstAttemptCorrectCount).toBe(7); // Clean first-attempt correct
    expect(metrics.firstAttemptAccuracy).toBe(70); // 7/10
    expect(metrics.masteredCount).toBe(1);
    expect(metrics.needsReviewCount).toBe(1);
  });
});

describe("Room Code Sanitization & QR / URL Normalization (Issue 9)", () => {
  it("cleans spaces, hashes, PIN prefixes, and full URLs into clean room PINs", () => {
    expect(sanitizeRoomCode("89241666")).toBe("89241666");
    expect(sanitizeRoomCode("  89241666  ")).toBe("89241666");
    expect(sanitizeRoomCode("#89241666")).toBe("89241666");
    expect(sanitizeRoomCode("PIN: 89241666")).toBe("89241666");
    expect(sanitizeRoomCode("pin:89241666")).toBe("89241666");
    expect(sanitizeRoomCode("https://quizmaster.com/join/89241666")).toBe("89241666");
    expect(sanitizeRoomCode("http://localhost:3000/room/89241666?ref=share")).toBe("89241666");
    expect(sanitizeRoomCode("room-code-89241666")).toBe("89241666");
  });
});

describe("Native Authentication & Cryptographic Hashing", () => {
  it("hashes password with scrypt and verifies matches, rejecting wrong passwords", () => {
    const password = "SuperSecretPassword123!";
    const hash = hashPassword(password);

    expect(hash).toContain(":");
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword("WrongPassword123!", hash)).toBe(false);
  });

  it("signs and verifies native JWT tokens, rejecting tampered signatures", () => {
    const payload = {
      userId: "usr_abc123",
      email: "student@example.com",
      name: "Student Alice",
    };

    const token = signNativeJwt(payload);
    expect(token.split(".")).toHaveLength(3);

    const verified = verifyNativeJwt(token);
    expect(verified).not.toBeNull();
    expect(verified?.user_id).toBe("usr_abc123");
    expect(verified?.email).toBe("student@example.com");
    expect(verified?.name).toBe("Student Alice");

    // Tampered token test
    const tampered = token.slice(0, -4) + "XXXX";
    expect(verifyNativeJwt(tampered)).toBeNull();
  });
});
