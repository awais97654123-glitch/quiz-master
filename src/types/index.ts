export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuizMode = "SINGLE" | "MULTIPLAYER";
export type QuizStatus = "DRAFT" | "WAITING" | "LIVE" | "FINISHED" | "CANCELLED";
export type AttemptStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";

export interface User {
  id: string;
  authProviderId: string;
  email: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  username: string;
  institution: string;
  avatarUrl?: string | null;
  bio?: string | null;
  profileCompleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Course {
  id: string;
  name: string; // "HTML" | "CSS" | "JavaScript"
  slug: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  courseId: string;
  name: string;
  slug: string;
}

export interface Question {
  id: string;
  courseId: string;
  topicId: string;
  difficulty: Difficulty;
  type: string;
  question: string;
  code?: string | null;
  options: string[]; // Parsed from JSON string
  correctAnswer?: string; // Optional when sent to client during attempt!
  explanation?: string;
  generationSource?: string;
  createdAt?: string | Date;
  topic?: Topic;
  course?: Course;
}

export interface Quiz {
  id: string;
  creatorId: string;
  creator?: User;
  name: string;
  courseId: string;
  course?: Course;
  questionCount: number;
  duration: number; // in minutes
  mode: QuizMode;
  status: QuizStatus;
  roomCode?: string | null;
  description?: string | null;
  createdAt: string | Date;
  startedAt?: string | Date | null;
  endedAt?: string | Date | null;
  quizTopics?: { topic: Topic }[];
  quizQuestions?: { question: Question; orderIndex: number }[];
  participants?: QuizParticipant[];
}

export interface QuizParticipant {
  id: string;
  quizId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    profile?: Profile | null;
  };
  joinedAt: string | Date;
  status: "JOINED" | "READY" | "ACTIVE" | "SUBMITTED" | "DISCONNECTED";
  lastSeenAt: string | Date;
}

export interface Attempt {
  id: string;
  quizId: string;
  quiz?: Quiz;
  userId: string;
  user?: User;
  startedAt: string | Date;
  expiresAt: string | Date;
  submittedAt?: string | Date | null;
  score?: number | null;
  percentage?: number | null;
  accuracy?: number | null;
  timeTaken?: number | null; // in seconds
  status: AttemptStatus;
  attemptQuestions?: {
    orderIndex: number;
    question: Question;
  }[];
  answers?: Answer[];
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string | Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  institution?: string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  accuracy: number;
  timeTaken: number; // in seconds
  submittedAt: string | Date | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
}

export interface TopicPerformance {
  topicName: string;
  total: number;
  correct: number;
  percentage: number;
}
