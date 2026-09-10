import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

// Official QuizMaster Firebase Project Credentials
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDmMBjj9GGxbxzYj93Bmd4tOsnDfI1X944",
  authDomain: "quiz-master-b672d.firebaseapp.com",
  projectId: "quiz-master-b672d",
  storageBucket: "quiz-master-b672d.firebasestorage.app",
  messagingSenderId: "370784960516",
  appId: "1:370784960516:web:bc94f5af9d738a88be7551",
  measurementId: "G-GGTFYW1M9L",
};

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    DEFAULT_FIREBASE_CONFIG.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID ||
    DEFAULT_FIREBASE_CONFIG.measurementId,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure Google OAuth provider with explicit account selection
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
googleProvider.addScope("email");
googleProvider.addScope("profile");

export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    // ignore
  }
};

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
