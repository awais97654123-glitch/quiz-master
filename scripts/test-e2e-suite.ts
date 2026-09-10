import { io as ClientIO } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

async function runE2ESuite() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING CODEQUIZ ARENA FULL E2E INTEGRATION SUITE");
  console.log("=======================================================\n");

  const results: { test: string; status: "PASS" | "FAIL"; details?: string }[] = [];

  async function assertStep(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log("✅ PASS");
      results.push({ test: name, status: "PASS" });
    } catch (err: any) {
      console.log(`❌ FAIL: ${err.message}`);
      results.push({ test: name, status: "FAIL", details: err.message });
      throw err;
    }
  }

  try {
    let bearerToken = "";
    let userId = "";
    let attemptId = "";
    let roomCode = "";
    let quizId = "";
    let courses: any[] = [];

    // 1. Courses & Curriculum Check
    await assertStep("1. Fetch Courses and 107 Curriculum Topics", async () => {
      const res = await fetch(`${BASE_URL}/api/courses`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.courses || data.courses.length < 3) {
        throw new Error(`Expected at least 3 courses, got ${data.courses?.length}`);
      }
      courses = data.courses;
      const totalTopics = courses.reduce((acc: number, c: any) => acc + (c.topics?.length || 0), 0);
      if (totalTopics < 100) {
        throw new Error(`Expected 107 topics, found ${totalTopics}`);
      }
    });

    // 2. Dev Login / Demo User Authentication
    await assertStep("2. Authenticate Demo Account (Alex Rivera)", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@codequiz.arena" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.token || !data.user?.id) throw new Error("Invalid login response");
      userId = data.user.id;
      bearerToken = `Bearer ${data.token}`;
    });

    // 3. User Profile Verification
    await assertStep("3. Fetch User Profile & Stats", async () => {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.profile || !data.profile.name) {
        throw new Error("Profile mismatch");
      }
    });

    // 4. Start Single Quiz
    await assertStep("4. Generate & Start Single Quiz Exam Session", async () => {
      const htmlCourse = courses.find((c) => c.slug === "html5") || courses[0];
      const topicIds = htmlCourse.topics.slice(0, 3).map((t: any) => t.id);

      const res = await fetch(`${BASE_URL}/api/quiz/single/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
        body: JSON.stringify({
          name: "HTML5 Certification Exam",
          courseId: htmlCourse.id,
          topicIds,
          questionCount: 5,
          durationMinutes: 15,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      if (!data.attemptId) throw new Error("No attemptId returned");
      attemptId = data.attemptId;
    });

    // 5. Fetch Attempt Questions & Verify Answer Protection
    let attemptQuestions: any[] = [];
    await assertStep("5. Fetch Attempt Questions & Verify Answer Protection", async () => {
      const res = await fetch(`${BASE_URL}/api/attempt/${attemptId}`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No attempt questions loaded");
      }
      attemptQuestions = data.questions;

      // SECURITY AUDIT: Ensure correctOptionIndex and explanations are NOT exposed during active exam!
      for (const q of attemptQuestions) {
        if ("correctAnswer" in q) {
          throw new Error("SECURITY FAILURE: correctAnswer exposed to client during active exam!");
        }
        if ("explanation" in q) {
          throw new Error("SECURITY FAILURE: explanation exposed to client during active exam!");
        }
      }
    });

    // 6. Answer Exam Questions
    await assertStep("6. Record Candidate Answers for Exam Questions", async () => {
      for (const q of attemptQuestions) {
        const res = await fetch(`${BASE_URL}/api/attempt/${attemptId}/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: bearerToken,
          },
          body: JSON.stringify({
            questionId: q.id,
            selectedAnswer: q.options[0], // Pick first option string
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to record answer for question ${q.id}: ${errText}`);
        }
      }
    });

    // 7. Submit Exam & Server-Side Grading
    await assertStep("7. Submit Exam & Execute Server-Authoritative Grading", async () => {
      const res = await fetch(`${BASE_URL}/api/attempt/${attemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Submit failed: ${errText}`);
      }
      const data = await res.json();
      if (data.status !== "SUBMITTED") {
        throw new Error(`Expected status SUBMITTED, got ${data.status}`);
      }
    });

    // 8. Inspect Result Breakdown & Post-Exam Explanations
    await assertStep("8. Fetch Graded Results & Educational Explanations", async () => {
      const res = await fetch(`${BASE_URL}/api/attempt/${attemptId}/result`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.score !== "number" || typeof data.accuracy !== "number") {
        throw new Error("Missing score/accuracy metrics");
      }
      if (!Array.isArray(data.reviewedQuestions) || data.reviewedQuestions.length === 0) {
        throw new Error("Missing reviewedQuestions in result review");
      }
      // In results, explanations and correct options MUST now be revealed
      const firstReviewed = data.reviewedQuestions[0];
      if (!firstReviewed.explanation || !firstReviewed.correctAnswer) {
        throw new Error("Missing explanation or correctAnswer in post-exam review");
      }
    });

    // 9. Academic History Verification
    await assertStep("9. Query Academic Exam History", async () => {
      const res = await fetch(`${BASE_URL}/api/history`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.history) || data.history.length === 0) {
        throw new Error("No exam history found");
      }
      const foundCurrent = data.history.some((a: any) => a.attemptId === attemptId);
      if (!foundCurrent) {
        throw new Error("Recently submitted exam not found in history");
      }
    });

    // 10. Create Multiplayer Tournament Room
    await assertStep("10. Initialize Multiplayer Room with 8-digit Code & QR", async () => {
      const cssCourse = courses.find((c) => c.slug === "css3") || courses[1];
      const topicIds = cssCourse.topics.slice(0, 3).map((t: any) => t.id);

      const res = await fetch(`${BASE_URL}/api/quiz/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
        body: JSON.stringify({
          name: "CSS3 Grand Prix",
          courseId: cssCourse.id,
          topicIds,
          questionCount: 5,
          durationMinutes: 15,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      if (!data.roomCode || data.roomCode.length !== 8) {
        throw new Error(`Expected 8-digit room code, got ${data.roomCode}`);
      }
      roomCode = data.roomCode;
      quizId = data.quizId;
    });

    // 11. Room Status Check
    await assertStep("11. Check Room Lobby Status API", async () => {
      const res = await fetch(`${BASE_URL}/api/room/${roomCode}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== "WAITING") {
        throw new Error(`Expected status WAITING, got ${data.status}`);
      }
    });

    // 12. Socket.IO Real-time Room Connection & Presence
    await assertStep("12. Socket.IO Real-time Join & Presence Broadcast", async () => {
      return new Promise<void>((resolve, reject) => {
        const socket = ClientIO(BASE_URL, { path: "/socket.io" });
        const timer = setTimeout(() => {
          socket.disconnect();
          reject(new Error("Socket connection timed out"));
        }, 6000);

        socket.on("connect", () => {
          socket.emit("join_room", {
            roomCode,
            user: {
              id: userId,
              name: "Alex Rivera",
              username: "alexrivera",
              avatarUrl: null,
            },
          });
        });

        socket.on("participants_update", (msg) => {
          if (msg.roomCode === roomCode && msg.participants?.length > 0) {
            clearTimeout(timer);
            socket.disconnect();
            resolve();
          }
        });

        socket.on("connect_error", (err) => {
          clearTimeout(timer);
          socket.disconnect();
          reject(err);
        });
      });
    });

    // 13. Question Bank Governance
    await assertStep("13. Inspect Question Bank Governance & Search API", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/questions?page=1&limit=10`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.questions) || data.total < 50) {
        throw new Error(`Expected >= 50 questions in bank, found ${data.total}`);
      }
    });

    // 14. Global Search Suggestions
    await assertStep("14. Global Search Autocomplete API", async () => {
      const res = await fetch(`${BASE_URL}/api/search?q=flexbox`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        throw new Error("No search results returned for query 'flexbox'");
      }
    });

    // 15. Phone Number OTP Authentication (Dev Login)
    await assertStep("15. Phone Number OTP Authentication (+923001234567)", async () => {
      const testPhone = "+923001234567";
      const res = await fetch(`${BASE_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: testPhone }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.token || data.user?.phoneNumber !== testPhone) {
        throw new Error(`Phone login failed. Expected phone ${testPhone}, got ${data.user?.phoneNumber}`);
      }
    });

    // 16. Firebase Token Sync with Phone Number
    await assertStep("16. Firebase Token Sync with Phone E.164 (+923009876543)", async () => {
      const testPhone = "+923009876543";
      const res = await fetch(`${BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer dev-phone:${testPhone}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.user?.phoneNumber !== testPhone) {
        throw new Error(`Token sync failed. Expected ${testPhone}, got ${data.user?.phoneNumber}`);
      }
    });

    // 17. Multiplayer Participant Synchronous Attempt Resolver
    await assertStep("17. Multiplayer Participant Direct Attempt Resolver (/api/attempt/by-quiz/[id])", async () => {
      const res = await fetch(`${BASE_URL}/api/attempt/by-quiz/${quizId}`, {
        headers: { Authorization: bearerToken },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.attemptId || !data.questions || data.questions.length === 0) {
        throw new Error("Participant attempt resolver did not return questions");
      }
    });

    console.log("\n=======================================================");
    console.log("🎉 ALL 17/17 E2E INTEGRATION SUITES PASSED FLAWLESSLY!");
    console.log("=======================================================\n");
  } catch (err: any) {
    console.error("\n❌ E2E SUITE ABORTED DUE TO ERROR:", err.message);
    process.exit(1);
  }
}

runE2ESuite();
