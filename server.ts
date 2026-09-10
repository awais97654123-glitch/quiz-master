import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import prisma from "./src/lib/prisma";
import { rankLeaderboardEntries } from "./src/lib/quiz-engine";

const dev = process.env.NODE_ENV !== "production" && !process.argv.includes("--prod");
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory active room participants registry for ultra-fast presence & reconnects
const activeRooms = new Map<
  string,
  Map<string, { socketId: string; user: { id: string; name: string; username: string; avatarUrl?: string | null } }>
>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentUserId: string | null = null;

    socket.on("join_room", async (data: { roomCode: string; user: { id: string; name: string; username: string; avatarUrl?: string | null } }) => {
      const { roomCode, user } = data;
      if (!roomCode || !user?.id) return;

      currentRoomCode = roomCode;
      currentUserId = user.id;

      socket.join(`room:${roomCode}`);

      if (!activeRooms.has(roomCode)) {
        activeRooms.set(roomCode, new Map());
      }
      activeRooms.get(roomCode)!.set(user.id, { socketId: socket.id, user });

      // Broadcast presence to everyone in the room
      const participants = Array.from(activeRooms.get(roomCode)!.values()).map((p) => p.user);
      io.to(`room:${roomCode}`).emit("participants_update", {
        roomCode,
        participants,
      });

      console.log(`[Socket] User ${user.name} (${user.id}) joined room ${roomCode}. Total: ${participants.length}`);
    });

    socket.on("start_quiz", async (data: { roomCode: string; quizId: string; creatorId: string }) => {
      const { roomCode, quizId, creatorId } = data;
      if (!roomCode || !quizId) return;

      try {
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
        });

        if (quiz && quiz.creatorId === creatorId) {
          await prisma.quiz.update({
            where: { id: quizId },
            data: {
              status: "LIVE",
              startedAt: new Date(),
            },
          });

          io.to(`room:${roomCode}`).emit("quiz_started", {
            roomCode,
            quizId,
            startedAt: new Date().toISOString(),
          });

          console.log(`[Socket] Quiz ${quizId} started in room ${roomCode}`);
        }
      } catch (err) {
        console.error("[Socket] Failed to start quiz:", err);
      }
    });

    socket.on("participant_submitted", async (data: { roomCode: string; quizId: string; userId: string }) => {
      const { roomCode, quizId } = data;
      if (!roomCode || !quizId) return;

      try {
        // Query current attempts for this multiplayer quiz
        const attempts = await prisma.attempt.findMany({
          where: { quizId },
          include: {
            user: {
              include: { profile: true },
            },
            attemptQuestions: true,
          },
        });

        const unrankedEntries = attempts.map((att) => ({
          userId: att.userId,
          name: att.user.profile?.name || att.user.email.split("@")[0],
          username: att.user.profile?.username || "student",
          avatarUrl: att.user.profile?.avatarUrl,
          institution: att.user.profile?.institution,
          score: att.score ?? 0,
          totalQuestions: att.attemptQuestions ? att.attemptQuestions.length : 10,
          percentage: att.percentage ?? 0,
          accuracy: att.accuracy ?? 0,
          timeTaken: att.timeTaken ?? 0,
          submittedAt: att.submittedAt ? att.submittedAt.toISOString() : null,
          status: att.status as "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT",
        }));

        const rankedEntries = rankLeaderboardEntries(unrankedEntries);

        io.to(`room:${roomCode}`).emit("leaderboard_update", {
          roomCode,
          quizId,
          leaderboard: rankedEntries,
        });
      } catch (err) {
        console.error("[Socket] Failed to update leaderboard:", err);
      }
    });

    socket.on("student_cheat_warning", (data: { roomCode?: string; quizId: string; userId: string; userName: string; violations: number }) => {
      io.emit("student_cheat_warning", data);
      console.log(`[AntiCheat] Tab switch violation #${data.violations} reported for ${data.userName} (${data.userId})`);
    });

    socket.on("disqualify_participant", async (data: { roomCode?: string; quizId: string; targetUserId: string; reason?: string }) => {
      const { quizId, targetUserId, reason } = data;
      try {
        await prisma.attempt.updateMany({
          where: { quizId, userId: targetUserId },
          data: { status: "TIMED_OUT", submittedAt: new Date() },
        });

        io.emit("student_disqualified", {
          quizId,
          userId: targetUserId,
          reason: reason || "Academic Dishonesty: Tab Switch Cheating",
        });
      } catch (err) {
        console.error("[AntiCheat] Failed to disqualify participant:", err);
      }
    });

    socket.on("disconnect", () => {
      if (currentRoomCode && currentUserId && activeRooms.has(currentRoomCode)) {
        const room = activeRooms.get(currentRoomCode)!;
        room.delete(currentUserId);
        const participants = Array.from(room.values()).map((p) => p.user);
        io.to(`room:${currentRoomCode}`).emit("participants_update", {
          roomCode: currentRoomCode,
          participants,
        });
        if (room.size === 0) {
          activeRooms.delete(currentRoomCode);
        }
        console.log(`[Socket] User ${currentUserId} left room ${currentRoomCode}. Remaining: ${participants.length}`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> CodeQuiz Arena Server ready on http://localhost:${port}`);
  });
});
