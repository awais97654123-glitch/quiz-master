import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

// Official QuizMaster Firebase Project Credentials (quiz-master-11)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA6oUaHZVADEh9nlBPxpp3V3Noq-K7yk6E",
  authDomain: "quiz-master-11.firebaseapp.com",
  projectId: "quiz-master-11",
  storageBucket: "quiz-master-11.firebasestorage.app",
  messagingSenderId: "884729814039",
  appId: "1:884729814039:web:97ee6ed01acae7bbe5d052",
  measurementId: "G-EZHXJNXDM0",
};

function sanitizeConfigValue(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const trimmed = raw.replace(/^["'\s]+|["'\s]+$/g, "").trim();
  if (
    !trimmed ||
    trimmed.includes("your-") ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed.length < 5
  ) {
    return fallback;
  }
  return trimmed;
}

const firebaseConfig = {
  apiKey: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    DEFAULT_FIREBASE_CONFIG.apiKey
  ),
  authDomain: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    DEFAULT_FIREBASE_CONFIG.authDomain
  ),
  projectId: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    DEFAULT_FIREBASE_CONFIG.projectId
  ),
  storageBucket: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    DEFAULT_FIREBASE_CONFIG.storageBucket
  ),
  messagingSenderId: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    DEFAULT_FIREBASE_CONFIG.messagingSenderId
  ),
  appId: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    DEFAULT_FIREBASE_CONFIG.appId
  ),
  measurementId: sanitizeConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
    DEFAULT_FIREBASE_CONFIG.measurementId
  ),
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Safe Analytics Initialization for SSR/Next.js
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

// Configure Google OAuth provider with explicit account selection
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
googleProvider.addScope("email");
googleProvider.addScope("profile");

export const signOutUser = async () => {
  try {
    if (auth) {
      await firebaseSignOut(auth);
    }
  } catch (err) {
    // ignore
  }
};

export {
  app,
  auth,
  analytics,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
