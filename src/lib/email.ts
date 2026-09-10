/**
 * QuizMaster Transactional Email Dispatch Service
 * Powered by Resend API (HTTPS direct dispatch, 0 external package dependency)
 */

interface SendWelcomeEmailParams {
  toEmail: string;
  userName?: string | null;
}

export async function sendWelcomeEmail({ toEmail, userName }: SendWelcomeEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const displayName = userName || toEmail.split("@")[0] || "Developer";

  // Clean HTML Welcome Email matching QuizMaster futuristic dark aesthetic
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to QuizMaster</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060A18; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #0B132B; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { padding: 32px 40px; background: linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%); text-align: center; }
    .logo { font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; }
    .logo span { color: #38BDF8; }
    .content { padding: 40px; line-height: 1.6; color: #CBD5E1; }
    .greeting { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; }
    .highlight { color: #38BDF8; font-weight: 700; }
    .card { background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin: 24px 0; }
    .card-title { font-size: 14px; font-weight: 800; color: #A78BFA; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #2563EB 0%, #7C3AED 100%); color: #FFFFFF !important; font-weight: 800; text-decoration: none; border-radius: 12px; margin-top: 16px; box-shadow: 0 4px 14px rgba(37,99,235,0.4); text-align: center; }
    .footer { padding: 24px 40px; border-top: 1px solid #1E293B; text-align: center; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Quiz<span>Master</span></div>
      <p style="color: #E2E8F0; margin: 6px 0 0 0; font-size: 13px;">Live Frontend Coding Assessments & Competitions</p>
    </div>
    <div class="content">
      <div class="greeting">Welcome aboard, ${displayName}! 🚀</div>
      <p>Your QuizMaster account is now officially active. You have full access to our comprehensive question bank across <span class="highlight">HTML5</span>, <span class="highlight">CSS3</span>, and <span class="highlight">JavaScript Core</span>.</p>
      
      <div class="card">
        <div class="card-title">What you can do right now:</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E2E8F0;">
          <li>Take self-paced single assessments with instant AI explanations</li>
          <li>Host multiplayer tournaments with synchronized timers and QR codes</li>
          <li>Compete on global leaderboards and climb to the top of the Hall of Fame</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/single/setup" class="btn">
          Start Your First Quiz →
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

  // If no RESEND_API_KEY is configured, log in dev mode and exit cleanly without breaking sign-in
  if (!apiKey || apiKey === "mock-api-key") {
    console.log(`[Email Service (Dev Simulation)] Welcome email dispatched to: ${toEmail} for ${displayName}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "QuizMaster <onboarding@resend.dev>",
        to: [toEmail],
        subject: `Welcome to QuizMaster, ${displayName}! 🚀 Test Your Skills`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.warn("[Email Service] Resend API response error:", errorData);
      return { success: false, error: errorData };
    }

    const data = await res.json();
    console.log(`[Email Service] Real Welcome email delivered via Resend: ${data.id}`);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.warn("[Email Service] Network error dispatching email:", err.message);
    return { success: false, error: err.message };
  }
}
