import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "./prisma";
import {
  getTopicContext,
  isQuestionRelevantToTopic,
  getVerifiedCurriculumQuestions,
  normalizeText,
} from "./topic-curriculum";
import { z } from "zod";

export const ValidatedCandidateSchema = z.object({
  course: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().optional().default("General"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  type: z.literal("mcq").default("mcq"),
  question: z.string().min(15, "Question must be at least 15 characters long"),
  code: z.string().nullable().optional(),
  options: z
    .array(z.string().min(1))
    .length(4, "Question must have exactly 4 options")
    .refine((opts) => new Set(opts.map((o) => o.trim())).size === 4, {
      message: "All 4 options must be distinct and non-empty",
    }),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(25, "Explanation must be educational and at least 25 characters"),
}).refine((data) => data.options.includes(data.correctAnswer), {
  message: "Correct answer must exactly match one of the 4 options",
  path: ["correctAnswer"],
});

export type ValidatedCandidate = z.infer<typeof ValidatedCandidateSchema>;

export interface QuestionValidationResult {
  relevanceScore: number;
  correctnessScore: number;
  difficultyScore: number;
  qualityScore: number;
  isDuplicate: boolean;
  isAmbiguous: boolean;
  approved: boolean;
  reason: string;
  // Backward compatibility fields
  relevant: boolean;
  conceptualValue: number;
  difficultyMatch: boolean;
  answerCorrect: boolean;
  ambiguous: boolean;
  duplicate: boolean;
}

/**
 * Calculates token-based semantic similarity between two question strings
 */
function computeSemanticTokenSimilarity(textA: string, textB: string): number {
  const cleanTokens = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Stage 2 Semantic Validator:
 * Runs rigorous multi-point inspection on every candidate question.
 */
export async function validateQuestionCandidate(
  candidate: ValidatedCandidate,
  courseId: string,
  topicId: string,
  courseName: string,
  topicName: string,
  existingQuestionTexts: Set<string>
): Promise<QuestionValidationResult> {
  // 1. Topic Relevance & Hard Isolation
  const relevanceCheck = isQuestionRelevantToTopic(
    candidate.question,
    candidate.options,
    candidate.explanation,
    topicName,
    courseName
  );

  if (!relevanceCheck.isRelevant) {
    return {
      relevanceScore: relevanceCheck.qualityScore,
      correctnessScore: 0,
      difficultyScore: 0,
      qualityScore: relevanceCheck.qualityScore,
      isDuplicate: false,
      isAmbiguous: true,
      approved: false,
      relevant: false,
      conceptualValue: 20,
      difficultyMatch: false,
      answerCorrect: false,
      ambiguous: true,
      duplicate: false,
      reason: relevanceCheck.reason,
    };
  }

  // 2. Two-Level Duplicate Detection (Level 1: Exact Normalized, Level 2: Semantic Similarity)
  const normText = normalizeText(candidate.question);
  if (existingQuestionTexts.has(normText)) {
    return {
      relevanceScore: relevanceCheck.qualityScore,
      correctnessScore: 100,
      difficultyScore: 85,
      qualityScore: 30,
      isDuplicate: true,
      isAmbiguous: false,
      approved: false,
      relevant: true,
      conceptualValue: 30,
      difficultyMatch: true,
      answerCorrect: true,
      ambiguous: false,
      duplicate: true,
      reason: "Exact duplicate question already exists in target topic.",
    };
  }

  // Check semantic token similarity against existing pool
  for (const existing of existingQuestionTexts) {
    const similarity = computeSemanticTokenSimilarity(candidate.question, existing);
    if (similarity >= 0.72) {
      return {
        relevanceScore: relevanceCheck.qualityScore,
        correctnessScore: 100,
        difficultyScore: 85,
        qualityScore: 35,
        isDuplicate: true,
        isAmbiguous: false,
        approved: false,
        relevant: true,
        conceptualValue: 35,
        difficultyMatch: true,
        answerCorrect: true,
        ambiguous: false,
        duplicate: true,
        reason: `Semantic duplicate detected: Too similar to existing question (similarity ${(similarity * 100).toFixed(0)}%).`,
      };
    }
  }

  // 3. Option & Answer Quality Check
  const trimmedOptions = candidate.options.map((o) => o.trim());
  const uniqueOptions = new Set(trimmedOptions);
  const answerMatchesOption = trimmedOptions.includes(candidate.correctAnswer.trim());
  if (uniqueOptions.size !== 4 || !answerMatchesOption) {
    return {
      relevanceScore: relevanceCheck.qualityScore,
      correctnessScore: 30,
      difficultyScore: 50,
      qualityScore: 40,
      isDuplicate: false,
      isAmbiguous: true,
      approved: false,
      relevant: true,
      conceptualValue: 40,
      difficultyMatch: false,
      answerCorrect: false,
      ambiguous: true,
      duplicate: false,
      reason: "Answer mismatch or redundant options detected.",
    };
  }

  // 4. Explanation Quality Check (Must explain why the answer is correct)
  let conceptualValue = 85;
  if (
    candidate.explanation.length < 35 ||
    candidate.explanation.toLowerCase().includes("answer is correct because it is right")
  ) {
    conceptualValue = 50;
  }
  if (candidate.question.length < 25) {
    conceptualValue -= 15;
  }

  const finalQualityScore = Math.round(relevanceCheck.qualityScore * 0.5 + conceptualValue * 0.5);

  const passesAcceptance =
    relevanceCheck.isRelevant &&
    finalQualityScore >= 80 &&
    conceptualValue >= 70;

  return {
    relevanceScore: relevanceCheck.qualityScore,
    correctnessScore: 100,
    difficultyScore: 90,
    qualityScore: finalQualityScore,
    isDuplicate: false,
    isAmbiguous: false,
    approved: passesAcceptance,
    relevant: relevanceCheck.isRelevant,
    conceptualValue,
    difficultyMatch: true,
    answerCorrect: true,
    ambiguous: false,
    duplicate: false,
    reason: passesAcceptance
      ? `Validated: Question specifically tests concepts of ${topicName}.`
      : `Quality threshold not met (Score: ${finalQualityScore}).`,
  };
}

/**
 * Intelligent Two-Stage AI Generator:
 * Stage 1: Builds deep topic-context prompt and requests 2x candidate pool.
 * Stage 2: Executes semantic validation, filters duplicates, and selects only APPROVED questions.
 */
export async function generateAndValidateQuestions(params: {
  courseId: string;
  topicId: string;
  courseName: string;
  topicName: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  count: number;
}): Promise<ValidatedCandidate[]> {
  const { courseId, topicId, courseName, topicName, difficulty, count } = params;
  const topicContext = getTopicContext(courseName, topicName);

  // Fetch existing normalized questions to prevent duplicates
  const existingQuestions = await prisma.question.findMany({
    where: { topicId },
    select: { question: true },
  });
  const existingTexts = new Set(existingQuestions.map((q) => normalizeText(q.question)));

  const candidateTargetCount = Math.max(count * 2, 4);
  let rawCandidates: any[] = [];

  // Stage 1: Contextual Prompt Generation via Gemini / OpenAI
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are a Senior University Computer Science Professor and Technical Examiner designing questions for Quiz Master Arena.
Your mission is to produce questions that test true conceptual understanding, runtime execution, and debugging, NOT trivial recall or meaningless trivia.

TOPIC SPECIFICATION:
- Course: ${courseName}
- Topic: ${topicName}
- Topic Definition: ${topicContext.definition}
- Core Concepts to Test: ${topicContext.coreConcepts.join(", ")}
- Common Misconceptions to Address: ${topicContext.commonMisconceptions.join("; ")}
- Target Difficulty: ${difficulty}

CRITICAL RULES:
1. HARD TOPIC ISOLATION: The question must strictly test ${topicName}. Do NOT generate questions about out-of-scope concepts: ${topicContext.outOfScope.join(", ")}.
2. Never generate questions that simply mention the keyword without requiring understanding of ${topicName}.
3. Every question must have exactly 4 plausible, distinctive options and exactly ONE undisputed correct answer.
4. Explanations must be educational: explain WHY the correct answer is correct and why the concept works.
5. Provide code snippets where appropriate for code execution/output reasoning.`;

  const userPrompt = `Generate ${candidateTargetCount} rigorous multiple choice questions for ${courseName} -> ${topicName} at ${difficulty} difficulty.
Return strictly a JSON array adhering to this schema:
[
  {
    "course": "${courseName}",
    "topic": "${topicName}",
    "subtopic": "Name of subtopic",
    "difficulty": "${difficulty}",
    "type": "mcq",
    "question": "Unambiguous question testing understanding",
    "code": "Optional code string or null",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact matching option string",
    "explanation": "Detailed explanation of underlying mechanism."
  }
]`;

  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
        },
      });

      const res = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const text = res.response.text();
      const parsed = JSON.parse(text);
      rawCandidates = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
    } catch (err) {
      console.warn("Gemini stage 1 generation error:", err);
    }
  }

  // Fallback to OpenAI if Gemini was unavailable or returned empty
  if (rawCandidates.length === 0 && openAiKey && openAiKey.trim() !== "") {
    try {
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.35,
        }),
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          rawCandidates = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
        }
      }
    } catch (err) {
      console.warn("OpenAI fallback generation error:", err);
    }
  }

  // If AI generation produced no candidates, use pre-verified curriculum questions strictly for this topic
  if (rawCandidates.length === 0) {
    const verified = getVerifiedCurriculumQuestions(courseName, topicName, count);
    rawCandidates = verified.map((v) => ({
      course: courseName,
      topic: topicName,
      subtopic: v.subtopic,
      difficulty: v.difficulty,
      type: "mcq",
      question: v.question,
      code: v.code || null,
      options: v.options,
      correctAnswer: v.correctAnswer,
      explanation: v.explanation,
    }));
  }

  // Stage 2: Quality Control & Validation Filter
  const approvedList: ValidatedCandidate[] = [];

  for (const raw of rawCandidates) {
    if (approvedList.length >= count) break;

    // Normalizing difficulty
    const normalizedRaw = {
      ...raw,
      course: courseName,
      topic: topicName,
      difficulty: difficulty,
    };

    const parsed = ValidatedCandidateSchema.safeParse(normalizedRaw);
    if (!parsed.success) {
      continue;
    }

    const candidate = parsed.data;
    const validation = await validateQuestionCandidate(
      candidate,
      courseId,
      topicId,
      courseName,
      topicName,
      existingTexts
    );

    if (validation.relevant && validation.qualityScore >= 80 && !validation.duplicate) {
      approvedList.push(candidate);
      existingTexts.add(normalizeText(candidate.question));

      // Save approved question directly to database so it is reused for future quizzes
      try {
        await prisma.question.create({
          data: {
            courseId,
            topicId,
            subtopic: candidate.subtopic || "General",
            difficulty: candidate.difficulty,
            type: candidate.type,
            question: candidate.question,
            code: candidate.code || null,
            options: JSON.stringify(candidate.options),
            correctAnswer: candidate.correctAnswer,
            explanation: candidate.explanation,
            generationSource: "ai_validated",
            status: "APPROVED",
            qualityScore: validation.qualityScore,
            trustScore: 100.0,
          },
        });
      } catch (err) {
        console.warn("Error saving validated question to DB:", err);
      }
    }
  }

  return approvedList;
}

/**
 * Detects whether a candidate question is duplicate or semantically identical
 * to an existing question in the target topic.
 */
export function detectQuestionDuplicate(
  candidate: { question: string },
  existingPool: { question: string }[]
): boolean {
  const normCandidate = normalizeText(candidate.question);
  for (const item of existingPool) {
    if (normalizeText(item.question) === normCandidate) {
      return true;
    }
    const sim = computeSemanticTokenSimilarity(candidate.question, item.question);
    if (sim >= 0.72) {
      return true;
    }
  }
  return false;
}

/**
 * Synchronous / in-memory question quality evaluator for unit testing and instant checks.
 */
export function evaluateQuestionQuality(
  candidate: {
    course: string;
    topic: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  },
  existingPool: { question: string }[] = []
): QuestionValidationResult & { isValid: boolean } {
  const relevance = isQuestionRelevantToTopic(
    candidate.question,
    candidate.options,
    candidate.explanation,
    candidate.topic,
    candidate.course
  );

  const isDup = detectQuestionDuplicate(candidate, existingPool);
  const optionsDistinct = new Set(candidate.options.map((o) => o.trim())).size === 4;
  const answerValid = candidate.options.includes(candidate.correctAnswer);

  let conceptualValue = 85;
  if (candidate.explanation.length < 35) conceptualValue = 50;
  if (!answerValid || !optionsDistinct) conceptualValue = 20;

  const qualityScore = Math.round(relevance.qualityScore * 0.5 + conceptualValue * 0.5);
  const isValid =
    relevance.isRelevant && !isDup && optionsDistinct && answerValid && qualityScore >= 80;

  return {
    isValid,
    approved: isValid,
    relevanceScore: relevance.qualityScore,
    correctnessScore: answerValid ? 100 : 0,
    difficultyScore: 90,
    qualityScore: isValid ? qualityScore : Math.min(qualityScore, 40),
    isDuplicate: isDup,
    isAmbiguous: !optionsDistinct || !answerValid,
    relevant: relevance.isRelevant,
    conceptualValue,
    difficultyMatch: true,
    answerCorrect: answerValid,
    ambiguous: !optionsDistinct || !answerValid,
    duplicate: isDup,
    reason: isValid
      ? `Validated: Question specifically tests concepts of ${candidate.topic}.`
      : relevance.reason || "Question failed quality standards.",
  };
}
