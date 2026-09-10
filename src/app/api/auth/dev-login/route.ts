import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phoneNumber } = body;

    if (!email && !phoneNumber) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    if (phoneNumber) {
      const cleanDigits = phoneNumber.replace(/\D/g, "");
      const authUser = {
        id: `dev_phone_${cleanDigits}`,
        phoneNumber,
        name: `User ${phoneNumber.slice(-4)}`,
        authProviderId: `phone:${phoneNumber}`,
      };

      const dbUser = await getOrCreateDbUser(authUser);

      return NextResponse.json({
        token: `dev-phone:${phoneNumber}`,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          phoneNumber: dbUser.phoneNumber,
          firebaseUid: dbUser.firebaseUid,
          profileCompleted: dbUser.profile?.profileCompleted ?? false,
          profile: dbUser.profile,
        },
      });
    }

    const authUser = {
      id: `dev_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email,
      name: email.split("@")[0],
      authProviderId: `dev:${email}`,
    };

    const dbUser = await getOrCreateDbUser(authUser);

    return NextResponse.json({
      token: `dev-token:${email}`,
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
    console.error("Dev login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
