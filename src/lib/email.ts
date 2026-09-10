import { Resend } from "resend";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "mock-api-key") {
    return null;
  }
  return new Resend(apiKey);
};

interface SendWelcomeEmailParams {
  toEmail: string;
  userName?: string | null;
}

interface SendQuizResultEmailParams {
  toEmail: string;
  userName?: string | null;
  quizName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  attemptId: string;
}

interface SendRoomInviteEmailParams {
  toEmail: string;
  inviterName: string;
  roomCode: string;
  quizName: string;
}

/**
 * Sends a welcome onboarding email to newly registered developers
 */
export async function sendWelcomeEmail({ toEmail, userName }: SendWelcomeEmailParams) {
  const resend = getResendClient();
  const displayName = userName || toEmail.split("@")[0] || "Developer";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to QuizMaster Arena</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060A18; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #0B132B; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { padding: 32px 40px; background: linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%); text-align: center; }
    .logo { font-size: 26px; font-weight: 900; color: #FFFFFF; }
    .content { padding: 40px; line-height: 1.6; color: #CBD5E1; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #1D4ED8 0%, #06B6D4 100%); color: #FFFFFF !important; font-weight: 800; text-decoration: none; border-radius: 12px; margin-top: 16px; text-align: center; }
    .footer { padding: 24px 40px; border-top: 1px solid #1E293B; text-align: center; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">QuizMaster Arena</div>
      <p style="color: #E2E8F0; margin: 6px 0 0 0; font-size: 13px;">Technical Assessment & Multiplayer Coding Arena</p>
    </div>
    <div class="content">
      <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0;">Welcome aboard, ${displayName}! 🚀</h2>
      <p>Your academic profile is ready. You now have full access to verified examination pools across <strong>HTML5</strong>, <strong>CSS3</strong>, and <strong>JavaScript Core</strong>.</p>
      
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 10px 0; font-weight: 700; color: #38BDF8; font-size: 13px; text-transform: uppercase;">Features Available Now:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
          <li>Solo practice mode with immediate correct/incorrect explanation</li>
          <li>Real-time multiplayer tournaments with anti-cheat monitor</li>
          <li>Live performance dashboard with score trajectory analytics</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/single/setup" class="btn">
          Start First Assessment →
        </a>
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} QuizMaster Arena. Better Skills • Bigger Opportunities.
    </div>
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.log(`[Resend (Dev Simulation)] Welcome email dispatched to: ${toEmail}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "QuizMaster <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Welcome to QuizMaster Arena, ${displayName}! 🚀`,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Error] sendWelcomeEmail:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a scorecard summary email upon quiz completion
 */
export async function sendQuizResultEmail({
  toEmail,
  userName,
  quizName,
  score,
  totalQuestions,
  percentage,
  attemptId,
}: SendQuizResultEmailParams) {
  const resend = getResendClient();
  const displayName = userName || toEmail.split("@")[0] || "Student";
  const isPassing = percentage >= 60;
  const gradeColor = isPassing ? "#10B981" : "#F59E0B";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Quiz Assessment Results</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060A18; color: #F8FAFC; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #0B132B; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden;">
    <div style="padding: 28px 40px; background: linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%); text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">Official Score Report</h1>
      <p style="color: #E2E8F0; margin: 4px 0 0 0; font-size: 13px;">${quizName}</p>
    </div>
    <div style="padding: 36px 40px; color: #CBD5E1; line-height: 1.6;">
      <p style="margin-top: 0; font-size: 16px;">Hello <strong>${displayName}</strong>,</p>
      <p>Your examination session has concluded. Here is your verified performance breakdown:</p>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 42px; font-weight: 900; color: ${gradeColor};">${percentage}%</div>
        <div style="font-size: 14px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-top: 4px;">
          Score: ${score} / ${totalQuestions} Questions Correct
        </div>
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/result/${attemptId}" style="display: inline-block; padding: 12px 28px; background: #1D4ED8; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 10px; font-size: 14px;">
          Review Full Question Breakdown →
        </a>
      </div>
    </div>
    <div style="padding: 20px 40px; border-top: 1px solid #1E293B; text-align: center; font-size: 12px; color: #64748B;">
      QuizMaster Arena Automated Dispatch • Delivered via Resend API
    </div>
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.log(`[Resend (Dev Simulation)] Result email dispatched to: ${toEmail} (Score: ${percentage}%)`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "QuizMaster <results@resend.dev>",
      to: [toEmail],
      subject: `Score Report: ${percentage}% in ${quizName} 🎯`,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Error] sendQuizResultEmail:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a tournament room PIN invitation to a participant
 */
export async function sendRoomInviteEmail({
  toEmail,
  inviterName,
  roomCode,
  quizName,
}: SendRoomInviteEmailParams) {
  const resend = getResendClient();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060A18; color: #F8FAFC; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #0B132B; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden;">
    <div style="padding: 28px 40px; background: linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%); text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">Tournament Room Invitation</h1>
      <p style="color: #E2E8F0; margin: 4px 0 0 0; font-size: 13px;">${quizName}</p>
    </div>
    <div style="padding: 36px 40px; color: #CBD5E1; line-height: 1.6; text-align: center;">
      <p style="font-size: 15px;"><strong>${inviterName}</strong> has invited you to join a live quiz match!</p>
      
      <div style="background: rgba(37, 99, 235, 0.1); border: 2px dashed #2563EB; border-radius: 16px; padding: 20px; margin: 24px auto; max-width: 240px;">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #60A5FA; letter-spacing: 1px;">ROOM PIN</div>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #FFFFFF; font-family: monospace; margin-top: 4px;">${roomCode}</div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${roomCode}" style="display: inline-block; padding: 14px 32px; background: #1D4ED8; color: #FFFFFF; text-decoration: none; font-weight: 800; border-radius: 12px; font-size: 14px;">
        Join Room Instantly →
      </a>
    </div>
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.log(`[Resend (Dev Simulation)] Room invite dispatched to: ${toEmail} (PIN: ${roomCode})`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "QuizMaster <invites@resend.dev>",
      to: [toEmail],
      subject: `${inviterName} invited you to join quiz room #${roomCode} 🎮`,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Error] sendRoomInviteEmail:", err);
    return { success: false, error: err.message };
  }
}
