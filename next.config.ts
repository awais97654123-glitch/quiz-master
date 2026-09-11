import type { NextConfig } from "next";

function cleanEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  const clean = val.replace(/^["'\s]+|["'\s]+$/g, "").trim();
  if (!clean || clean.length < 5 || clean.includes("your-") || clean === "undefined" || clean === "null") {
    return fallback;
  }
  return clean;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      "AIzaSyA6oUaHZVADEh9nlBPxpp3V3Noq-K7yk6E"
    ),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      "quiz-master-11.firebaseapp.com"
    ),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      "quiz-master-11"
    ),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      "quiz-master-11.firebasestorage.app"
    ),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
      "884729814039"
    ),
    NEXT_PUBLIC_FIREBASE_APP_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      "1:884729814039:web:97ee6ed01acae7bbe5d052"
    ),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
      "G-EZHXJNXDM0"
    ),
    NEXT_PUBLIC_APP_URL: cleanEnv(
      process.env.NEXT_PUBLIC_APP_URL,
      "https://quiz-join.vercel.app"
    ),
    NEXT_PUBLIC_SITE_URL: cleanEnv(
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://quiz-join.vercel.app"
    ),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: cleanEnv(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      ""
    ),
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://quiz-master-11.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
