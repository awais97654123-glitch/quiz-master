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
      "AIzaSyDmMBjj9GGxbxzYj93Bmd4tOsnDfI1X944"
    ),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      "quiz-master-b672d.firebaseapp.com"
    ),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      "quiz-master-b672d"
    ),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      "quiz-master-b672d.firebasestorage.app"
    ),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
      "370784960516"
    ),
    NEXT_PUBLIC_FIREBASE_APP_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      "1:370784960516:web:bc94f5af9d738a88be7551"
    ),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
      "G-GGTFYW1M9L"
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
};

export default nextConfig;
