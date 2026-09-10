import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quiz-join.vercel.app";
  const redirectUri = `${siteUrl}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.redirect(`${siteUrl}/login?error=google_oauth_unconfigured`);
  }

  const searchParams = req.nextUrl.searchParams;
  const returnTo = searchParams.get("redirect") || "/dashboard";

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", encodeURIComponent(returnTo));

  return NextResponse.redirect(googleAuthUrl.toString());
}
