import { describe, it, expect } from "vitest";
import {
  calculateTopicDistribution,
  prepareQuizQuestions,
  calculateQuizResults,
  rankLeaderboardEntries,
  QuestionBankItem,
} from "../src/lib/quiz-engine";
import { generateRoomCode } from "../src/lib/utils";

describe("Quiz Engine - Distribution & Randomization", () => {
  it("intelligently distributes 20 questions across 4 topics equally", () => {
    const topics = ["t1", "t2", "t3", "t4"];
    const dist = calculateTopicDistribution(topics, 20);
    expect(dist).toHaveLength(4);
    expect(dist.map((d) => d.count)).toEqual([5, 5, 5, 5]);
    expect(dist.reduce((acc, curr) => acc + curr.count, 0)).toBe(20);
  });

  it("handles non-even division across topics gracefully (e.g. 10 questions across 3 topics)", () => {
    const topics = ["t1", "t2", "t3"];
    const dist = calculateTopicDistribution(topics, 10);
    expect(dist.reduce((acc, curr) => acc + curr.count, 0)).toBe(10);
    expect(dist.map((d) => d.count)).toEqual([4, 3, 3]);
  });

  it("never exposes correctAnswer to client during question preparation", () => {
    const mockQuestions: QuestionBankItem[] = [
      {
        id: "q1",
        courseId: "html",
        topicId: "semantic",
        difficulty: "MEDIUM",
        type: "mcq",
        question: "What is <article>?",
        code: null,
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Self-contained content",
      },
    ];

    const { clientQuestions, orderedQuestionIds } = prepareQuizQuestions(mockQuestions);
    expect(clientQuestions).toHaveLength(1);
    expect(orderedQuestionIds).toEqual(["q1"]);
    expect((clientQuestions[0] as any).correctAnswer).toBeUndefined();
    expect((clientQuestions[0] as any).explanation).toBeUndefined();
    expect(clientQuestions[0].options).toHaveLength(4);
  });
});

describe("Quiz Engine - Server-Authoritative Scoring", () => {
  const sampleQuestions: QuestionBankItem[] = [
    {
      id: "q1",
      courseId: "js",
      topicId: "arrays",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "Array test 1",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
      explanation: "Explanation 1",
      topic: { id: "t1", name: "Arrays" },
    },
    {
      id: "q2",
      courseId: "js",
      topicId: "arrays",
      difficulty: "MEDIUM",
      type: "mcq",
      question: "Array test 2",
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
      explanation: "Explanation 2",
      topic: { id: "t1", name: "Arrays" },
    },
    {
      id: "q3",
      courseId: "js",
      topicId: "promises",
      difficulty: "HARD",
      type: "mcq",
      question: "Promise test 1",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      explanation: "Explanation 3",
      topic: { id: "t2", name: "Promises" },
    },
    {
      id: "q4",
      courseId: "js",
      topicId: "promises",
      difficulty: "HARD",
      type: "mcq",
      question: "Promise test 2",
      options: ["A", "B", "C", "D"],
      correctAnswer: "D",
      explanation: "Explanation 4",
      topic: { id: "t2", name: "Promises" },
    },
  ];

  it("calculates score, percentage, and accuracy correctly on server", () => {
    const startedAt = new Date("2026-09-09T10:00:00Z");
    const submittedAt = new Date("2026-09-09T10:05:00Z"); // 5 mins

    // User gets 3 correct, 1 incorrect
    const userAnswers = [
      { questionId: "q1", selectedAnswer: "B" }, // correct
      { questionId: "q2", selectedAnswer: "C" }, // correct
      { questionId: "q3", selectedAnswer: "A" }, // correct
      { questionId: "q4", selectedAnswer: "B" }, // incorrect
    ];

    const result = calculateQuizResults(sampleQuestions, userAnswers, startedAt, submittedAt, 15);

    expect(result.score).toBe(3);
    expect(result.totalQuestions).toBe(4);
    expect(result.percentage).toBe(75);
    expect(result.accuracy).toBe(75);
    expect(result.timeTaken).toBe(300); // 300 seconds
    expect(result.isTimedOut).toBe(false);

    // Topic breakdown verification
    expect(result.topicBreakdown).toHaveLength(2);
    const arraysTopic = result.topicBreakdown.find((t) => t.topicName === "Arrays");
    const promisesTopic = result.topicBreakdown.find((t) => t.topicName === "Promises");

    expect(arraysTopic?.percentage).toBe(100);
    expect(promisesTopic?.percentage).toBe(50);
  });
});

describe("Deterministic Leaderboard Ranking Algorithm (Section 30 & 60)", () => {
  it("ranks users strictly by Score -> Accuracy -> Time Taken -> Timestamp -> UserID", () => {
    const entries = [
      {
        userId: "user_hamza",
        name: "Hamza",
        username: "hamza",
        score: 17,
        totalQuestions: 20,
        percentage: 85,
        accuracy: 85,
        timeTaken: 418, // 06:58
        submittedAt: "2026-09-09T10:10:00Z",
        status: "SUBMITTED" as const,
      },
      {
        userId: "user_ali",
        name: "Ali",
        username: "ali",
        score: 19,
        totalQuestions: 20,
        percentage: 95,
        accuracy: 95,
        timeTaken: 401, // 06:41 (faster than Sara)
        submittedAt: "2026-09-09T10:08:00Z",
        status: "SUBMITTED" as const,
      },
      {
        userId: "user_sara",
        name: "Sara",
        username: "sara",
        score: 19,
        totalQuestions: 20,
        percentage: 95,
        accuracy: 95,
        timeTaken: 432, // 07:12 (slower than Ali with same score)
        submittedAt: "2026-09-09T10:09:00Z",
        status: "SUBMITTED" as const,
      },
      {
        userId: "user_ahmed",
        name: "Ahmed",
        username: "ahmed",
        score: 18,
        totalQuestions: 20,
        percentage: 90,
        accuracy: 90,
        timeTaken: 385, // 06:25
        submittedAt: "2026-09-09T10:07:00Z",
        status: "SUBMITTED" as const,
      },
    ];

    const ranked = rankLeaderboardEntries(entries);

    // Expected order:
    // 1. Ali (19/20, 06:41)
    // 2. Sara (19/20, 07:12)
    // 3. Ahmed (18/20, 06:25)
    // 4. Hamza (17/20, 06:58)
    expect(ranked[0].name).toBe("Ali");
    expect(ranked[0].rank).toBe(1);

    expect(ranked[1].name).toBe("Sara");
    expect(ranked[1].rank).toBe(2);

    expect(ranked[2].name).toBe("Ahmed");
    expect(ranked[2].rank).toBe(3);

    expect(ranked[3].name).toBe("Hamza");
    expect(ranked[3].rank).toBe(4);
  });
});

describe("Room Code Generator", () => {
  it("generates an 8-digit numeric room code", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(8);
    expect(/^\d{8}$/.test(code)).toBe(true);
  });
});
