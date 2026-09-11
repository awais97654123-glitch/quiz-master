import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signNativeJwt } from "@/lib/auth-native";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name || "").trim() || cleanEmail.split("@")[0] || "Student";

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { authProviderId: `native:${cleanEmail}` },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password securely with crypto.scrypt
    const passwordHash = hashPassword(String(password));

    // Create user and profile
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        authProviderId: `native:${cleanEmail}`,
        profile: {
          create: {
            name: cleanName,
            username: `user_${Math.floor(1000 + Math.random() * 9000)}_${Date.now().toString().slice(-4)}`,
            institution: "CodeQuiz Academy",
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
            profileCompleted: false,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Sign native JWT
    const token = signNativeJwt({
      userId: newUser.id,
      email: newUser.email!,
      name: newUser.profile?.name,
    });

    // Asynchronously send welcome email
    if (!cleanEmail.endsWith(".local") && !cleanEmail.endsWith(".arena")) {
      sendWelcomeEmail({
        toEmail: cleanEmail,
        userName: newUser.profile?.name,
      }).catch((err) => console.warn("Welcome email async error:", err));
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        profileCompleted: newUser.profile?.profileCompleted ?? false,
        profile: newUser.profile,
      },
    });
  } catch (error: any) {
    console.error("Native registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register account" },
      { status: 500 }
    );
  }
}
