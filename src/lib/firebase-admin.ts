import prisma from "./prisma";
import { verifyNativeJwt } from "./auth-native";

export interface AuthenticatedUser {
  id: string; // Firebase UID or Native User ID
  email?: string | null;
  phoneNumber?: string | null;
  name?: string;
  avatarUrl?: string;
  authProviderId: string;
}

/**
 * Verifies incoming Bearer auth token:
 * Supports Native website JWTs, Firebase ID tokens, dev-tokens, dev-phone tokens
 */
export async function verifyAuthToken(authHeader?: string | null): Promise<AuthenticatedUser | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  // 1. Check if token is a Native website JWT
  const nativePayload = verifyNativeJwt(token);
  if (nativePayload) {
    return {
      id: nativePayload.user_id || nativePayload.sub,
      email: nativePayload.email,
      phoneNumber: null,
      name: nativePayload.name || nativePayload.email.split("@")[0],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${nativePayload.email}`,
      authProviderId: `native:${nativePayload.email}`,
    };
  }

  // 2. Firebase ID token (JWT format: header.payload.signature)
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      // Standardize base64url to base64 with proper padding
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padLength = (4 - (base64.length % 4)) % 4;
      const paddedBase64 = base64 + "=".repeat(padLength);
      const payloadStr = Buffer.from(paddedBase64, "base64").toString("utf-8");
      const payload = JSON.parse(payloadStr);

      const userId = payload.user_id || payload.sub || payload.uid;
      const phoneNumber = payload.phone_number || null;
      const email =
        payload.email ||
        (phoneNumber ? `${phoneNumber.replace(/\+/g, "")}@phone.local` : `${userId}@user.local`);
      const name =
        payload.name ||
        (phoneNumber ? `Student ${phoneNumber.slice(-4)}` : payload.email?.split("@")[0] || "Student");
      const avatarUrl = payload.picture;

      if (userId) {
        return {
          id: userId,
          email,
          phoneNumber,
          name,
          avatarUrl,
          authProviderId: userId,
        };
      }
    }
  } catch (err) {
    console.warn("Token parse warning:", err);
  }

  // Fallback for automated test scripts in development only
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    if (token.startsWith("dev-token:")) {
      const email = token.replace("dev-token:", "").trim();
      return {
        id: `dev_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email,
        name: email.split("@")[0],
        authProviderId: `dev:${email}`,
      };
    }
    if (token.startsWith("dev-phone:")) {
      const phoneNumber = token.replace("dev-phone:", "").trim();
      const cleanId = phoneNumber.replace(/[^0-9]/g, "");
      return {
        id: `dev_phone_${cleanId}`,
        phoneNumber,
        email: `${cleanId}@phone.codequiz.arena`,
        name: `User ${phoneNumber.slice(-4)}`,
        authProviderId: `phone:${phoneNumber}`,
      };
    }
  }

  return null;
}

/**
 * Synchronizes user with the PostgreSQL/Prisma database
 * Handles Email, Google, and Phone Number users with atomic upsert and account-linking
 */
export async function getOrCreateDbUser(authUser: AuthenticatedUser) {
  const orConditions: any[] = [
    { authProviderId: authUser.authProviderId },
    { firebaseUid: authUser.id },
  ];

  if (authUser.id && !authUser.id.startsWith("dev_")) {
    orConditions.push({ id: authUser.id });
  }

  if (authUser.phoneNumber) {
    orConditions.push({ phoneNumber: authUser.phoneNumber });
  }
  if (authUser.email) {
    orConditions.push({ email: authUser.email });
  }

  let user = await prisma.user.findFirst({
    where: { OR: orConditions },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        authProviderId: authUser.authProviderId,
        firebaseUid: authUser.id,
        phoneNumber: authUser.phoneNumber || null,
        email: authUser.email || null,
        profile: {
          create: {
            name:
              authUser.name ||
              (authUser.phoneNumber
                ? `Student ${authUser.phoneNumber.slice(-4)}`
                : authUser.email?.split("@")[0] || "Student"),
            username: `user_${Math.floor(1000 + Math.random() * 9000)}_${Date.now().toString().slice(-4)}`,
            institution: "CodeQuiz Academy",
            avatarUrl:
              authUser.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.phoneNumber || authUser.email || authUser.id}`,
            profileCompleted: false,
          },
        },
      },
      include: { profile: true },
    });
  } else {
    // If user already exists, update firebaseUid or phoneNumber if not yet attached (Account Linking)
    const updateData: any = {};
    if (!user.firebaseUid && authUser.id) {
      updateData.firebaseUid = authUser.id;
    }
    if (!user.phoneNumber && authUser.phoneNumber) {
      updateData.phoneNumber = authUser.phoneNumber;
    }
    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        include: { profile: true },
      });
    }
  }

  return user;
}
