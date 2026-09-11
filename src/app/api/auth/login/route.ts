import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signNativeJwt } from "@/lib/auth-native";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { authProviderId: `native:${cleanEmail}` },
        ],
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password combination." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This account was created with Google Sign-In. Please click 'Continue with Google' to log in.",
        },
        { status: 400 }
      );
    }

    const isValid = verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password combination." },
        { status: 401 }
      );
    }

    // Sign native JWT
    const token = signNativeJwt({
      userId: user.id,
      email: user.email || cleanEmail,
      name: user.profile?.name,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileCompleted: user.profile?.profileCompleted ?? false,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error("Native login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
