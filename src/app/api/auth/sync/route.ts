import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);

    // Asynchronously dispatch welcome email if email exists
    if (dbUser.email && !dbUser.email.endsWith(".local") && !dbUser.email.endsWith(".arena")) {
      sendWelcomeEmail({
        toEmail: dbUser.email,
        userName: dbUser.profile?.name,
      }).catch((err) => console.warn("Welcome email async error:", err));
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        phoneNumber: dbUser.phoneNumber,
        firebaseUid: dbUser.firebaseUid,
        profileCompleted: dbUser.profile?.profileCompleted ?? false,
        profile: dbUser.profile,
      },
    });
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
