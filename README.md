# CodeQuiz Arena 🎓⚡

> A complete, production-ready, full-stack online examination and live multiplayer quiz platform specializing in **HTML**, **CSS**, and **JavaScript**.

---

## 🏛️ Project Architecture

CodeQuiz Arena is architected as an academic examination system with server-authoritative scoring, real-time multiplayer lobbies, AI-driven question generation, and deterministic ranking.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js 15 (App Router)                       │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   Academic Examination  │  │   Live Tournament Multiplayer       │  │
│  │   - Single Quiz Mode    │  │   - 8-Digit Room Codes              │  │
│  │   - Topic Distribution  │  │   - Real SVG QR Code Scanner        │  │
│  │   - Question Review     │  │   - Deterministic Leaderboard       │  │
│  └─────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   AI Question Pipeline  │  │   Socket.IO & Realtime Server       │  │
│  │   - Google Gemini Flash │  │   - Bidirectional WebSocket Lobbies │  │
│  │   - Zod Schema Defense  │  │   - Instant Participant Presence    │  │
│  │   - Duplicate Detection │  │   - Synchronous Quiz Start          │  │
│  └─────────────────────────┘  └─────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         Prisma ORM (v6)
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                                                               │
PostgreSQL (Neon / Local)                               SQLite (Dev Mode)
- Users & Profiles                                      - Zero-config instant local
- Courses & 100+ Topics                                   pairing & CI tests
- Question Bank & Attempts
```

---

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti, QR Code SVG.
- **Backend:** Next.js API Route Handlers, Node.js HTTP Server with integrated Socket.IO.
- **Database:** PostgreSQL (Neon Serverless Postgres) via Prisma ORM v6 (with SQLite dev-mode fallback).
- **Authentication:** Firebase Authentication (Email/Password & Google Sign-In) with automatic PostgreSQL profile creation and local dev token support.
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) for automated, schema-validated curriculum question generation.
- **Testing:** Vitest test suite covering question distribution, randomization, server scoring, deterministic ranking, and room code safety.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the project root (reference `.env.example`):

```env
# Database (PostgreSQL / Neon connection string)
DATABASE_URL="postgresql://username:password@ep-sample-12345.us-east-2.aws.neon.tech/codequiz?sslmode=require"

# Google Gemini API Key (Get from https://aistudio.google.com/)
GEMINI_API_KEY="AIzaSy..."

# Firebase Client Configuration (Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="codequiz-arena.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="codequiz-arena"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="codequiz-arena.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
NODE_ENV="development"
```

---

## 🗄️ Database Setup & Migrations

### 1. Push Schema to Database
To synchronize the Prisma schema with your database (PostgreSQL or SQLite):

```bash
npx prisma db push
```

### 2. Seed Initial Curriculums & Question Bank
Populates all courses (HTML, CSS, JavaScript), all 102+ topics, test users, and curated question bank:

```bash
npm run seed
```

### 3. Expand Question Bank with Gemini AI
To generate and validate questions across course topics using the AI pipeline:

```bash
npm run generate-question-bank
```

---

## 🧪 Running Automated Tests

Run the comprehensive unit test suite:

```bash
npm test
```

Tests cover:
- **Topic Distribution:** Even distribution across chosen topics (e.g. 20 questions across 4 topics = 5 each).
- **Randomization & Security:** Ensures `correctAnswer` is never leaked to the client during active attempts.
- **Server Scoring:** Accurate calculation of score, percentage, accuracy, and topic-by-topic breakdowns.
- **Deterministic Leaderboard Algorithm:** 5-step sorting (Score ↓ → Accuracy ↓ → Time Taken ↑ → Timestamp ↑ → User ID ↑).
- **Room Code Generation:** Validates collision-safe 8-digit codes.

---

## 💻 Local Development

Run the Next.js and Socket.IO server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Acceptance User Journeys

### Journey A: Individual Examination Mode
1. Register at `/register` or sign in with Google / instant test accounts at `/login`.
2. Complete academic profile at `/profile/setup`.
3. Click **SINGLE QUIZ** on Dashboard (`/quiz/single/setup`).
4. Select **HTML** or **CSS** or **JavaScript**, choose specific topics (e.g., *Semantic HTML*, *Flexbox*, *Closures*).
5. Choose question count (e.g. 10 or 20) and time limit (e.g. 15 mins).
6. Click **Begin Examination**:
   - Server initializes attempt with server-authoritative timer.
   - Questions and options are randomized.
   - Answers are saved dynamically.
7. Click **Submit Assessment** -> Server calculates score, accuracy, time taken, and topic breakdown.
8. Review question explanations at `/quiz/result/[attemptId]`.

### Journey B: Real-Time Live Tournament Mode
1. Host logs in and clicks **CREATE QUIZ** (`/quiz/create/setup`).
2. Configures quiz title, course, topics, questions, and duration.
3. System creates a waiting room at `/room/[roomCode]` with a unique **8-digit code** and a **real SVG QR code**.
4. Participant joins via code search, direct link `/join/[roomCode]`, or QR scan.
5. Host immediately sees participant appear in the live participant list without refreshing.
6. Host clicks **Start Quiz for All**:
   - Server transitions room to `LIVE` and broadcasts `quiz_started`.
   - All participants are automatically redirected to `/live/[quizId]`.
   - Host sees the real-time **Deterministic Live Leaderboard** (`/live/[quizId]/dashboard`).
7. Participants solve questions against the synchronized server timer.
8. As participants submit, leaderboard automatically re-ranks competitors.
9. Final podium highlights 1st (Gold 🏆), 2nd (Silver 🥈), and 3rd (Bronze 🥉).

---

## 🚢 Production Deployment

1. **Deploy to Vercel or Container/VM:**
   - Set environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, Firebase keys).
   - Build script: `npm run build`.
   - Start script: `npm start` (runs `server.ts` with Next.js + Socket.IO on port 3000 or custom port).
2. **Neon PostgreSQL:**
   - In Neon Console, create a new project and copy the connection string into `DATABASE_URL`.
   - Run `npx prisma db push && npm run seed` to initialize schema and seed bank.
