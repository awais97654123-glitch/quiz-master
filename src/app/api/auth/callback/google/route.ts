import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const returnTarget = state ? decodeURIComponent(state) : "/dashboard";

    const clientId =
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quiz-join.vercel.app";
    const redirectUri = `${siteUrl}/api/auth/callback/google`;

    if (!code) {
      return NextResponse.redirect(`${siteUrl}/login?error=no_code`);
    }

    if (!clientId || !clientSecret) {
      console.warn("Google OAuth credentials missing in environment");
      return NextResponse.redirect(`${siteUrl}/login?error=google_missing_credentials`);
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Failed to exchange Google OAuth code:", errText);
      return NextResponse.redirect(`${siteUrl}/login?error=google_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${siteUrl}/login?error=google_userinfo_failed`);
    }

    const googleUser = await userRes.json();
    const email = googleUser.email;
    const name = googleUser.name || email.split("@")[0];
    const avatarUrl = googleUser.picture;

    const authUser = {
      id: `google_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email,
      name,
      avatarUrl,
      authProviderId: `google:${email}`,
    };

    const dbUser = await getOrCreateDbUser(authUser);
    const token = `dev-token:${email}`;

    // Return HTML that stores tokens in localStorage and redirects
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff;">
          <div style="text-align: center;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 16px; font-size: 14px; color: #94a3b8;">Completing Google authentication...</p>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
          <script>
            try {
              localStorage.setItem('codequiz_token', ${JSON.stringify(token)});
              localStorage.setItem('codequiz_user', ${JSON.stringify(
                JSON.stringify({
                  id: dbUser.id,
                  email: dbUser.email,
                  phoneNumber: dbUser.phoneNumber,
                  firebaseUid: dbUser.firebaseUid,
                  profileCompleted: dbUser.profile?.profileCompleted ?? false,
                  profile: dbUser.profile,
                })
              )});
              localStorage.setItem('last_google_email', ${JSON.stringify(email)});
              localStorage.setItem('last_google_name', ${JSON.stringify(name)});
              window.dispatchEvent(new Event('auth_state_changed'));
              window.location.href = ${JSON.stringify(returnTarget)};
            } catch (err) {
              window.location.href = '/login';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("Google callback exception:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://quiz-join.vercel.app"}/login?error=callback_error`
    );
  }
}
