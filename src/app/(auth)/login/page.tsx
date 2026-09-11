"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
  auth,
} from "@/lib/firebase";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";
import { triggerGlobalLoading } from "@/lib/loading-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || searchParams.get("returnUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize authenticated user with backend database
  const handleSyncUser = async (token: string) => {
    triggerGlobalLoading(true, "Logging in...");
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("codequiz_token", token);
        localStorage.setItem("codequiz_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth_state_changed"));

        if (!data.user.profileCompleted) {
          router.push(`/profile/setup?redirect=${encodeURIComponent(redirectTarget)}`);
        } else {
          router.push(redirectTarget);
        }
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to synchronize profile");
      }
    } catch (err: any) {
      setError(err.message || "Network sync error");
    } finally {
      setIsLoading(false);
      triggerGlobalLoading(false);
    }
  };

  // Check for redirect result on page mount (e.g. mobile or redirect-based auth)
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then(async (cred) => {
        if (cred?.user) {
          setIsLoading(true);
          triggerGlobalLoading(true, "Completing Google sign-in...");
          const token = await cred.user.getIdToken();
          await handleSyncUser(token);
        }
      })
      .catch((err) => {
        console.error("Redirect auth error:", err);
        mapFirebaseError(err);
      });
  }, []);

  // 1. Native Website Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    triggerGlobalLoading(true, "Signing in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      localStorage.setItem("codequiz_token", data.token);
      localStorage.setItem("codequiz_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth_state_changed"));

      if (!data.user.profileCompleted) {
        router.push(`/profile/setup?redirect=${encodeURIComponent(redirectTarget)}`);
      } else {
        router.push(redirectTarget);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
      triggerGlobalLoading(false);
    }
  };

  // 2. Real Google Sign-In via Firebase
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    triggerGlobalLoading(true, "Connecting with Google...");

    if (!auth) {
      setError("Firebase Authentication is not initialized.");
      setIsLoading(false);
      triggerGlobalLoading(false);
      return;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      await handleSyncUser(token);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setIsLoading(false);
      triggerGlobalLoading(false);

      if (err.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          mapFirebaseError(redirectErr);
          return;
        }
      }

      mapFirebaseError(err);
    }
  };

  const mapFirebaseError = (err: any) => {
    switch (err.code) {
      case "auth/invalid-email":
        setError("Invalid email address format.");
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        setError("Invalid email or password combination.");
        break;
      case "auth/too-many-requests":
        setError("Too many failed attempts. Please try again in a few minutes.");
        break;
      case "auth/popup-closed-by-user":
        setError("Sign-in cancelled. The Google sign-in window was closed.");
        break;
      case "auth/unauthorized-domain": {
        const domain = typeof window !== "undefined" ? window.location.hostname : "your domain";
        setError(
          `Domain "${domain}" is not authorized in Firebase. Please add "${domain}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
        break;
      }
      case "auth/operation-not-allowed":
        setError(
          "Sign-in method is disabled in Firebase Console. Please enable Email/Password and Google in Firebase Console -> Authentication -> Sign-in method."
        );
        break;
      case "auth/network-request-failed":
        setError("Network error. Please check your internet connection.");
        break;
      default:
        setError(err.message || "Authentication error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-100 dark:bg-slate-950">
      {/* Split Auth Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-border bg-card">
        
        {/* Left Side: Form Container */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-6">
              <QuizMasterLogo size="md" variant="auto" />
            </div>

            <div className="space-y-1 mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-muted-foreground">
                Login to your account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <span>{error}</span>
                  {error.includes("Authorized domains") && (
                    <div className="pt-2 text-xs">
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold underline hover:opacity-80"
                      >
                        Open Firebase Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email + Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? "Signing in..." : "Login"}</span>
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold">
                  OR
                </span>
              </div>
            </div>

            {/* Real Firebase Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl border border-border hover:border-slate-400 dark:hover:border-slate-600 bg-background hover:bg-muted/60 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {/* Official Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="pt-8 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Right Side: Dark Blue Illustration Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0B132B] p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-center">
            <QuizMasterLogo size="lg" variant="light" />
          </div>

          {/* Center Graphic & Tagline */}
          <div className="relative z-10 text-center space-y-6 my-auto py-8">
            <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold text-blue-400">
              <span>Learn</span>
              <span className="text-slate-600">•</span>
              <span>Practice</span>
              <span className="text-slate-600">•</span>
              <span>Grow</span>
            </div>

            {/* Developer Illustration SVG */}
            <div className="w-56 h-56 mx-auto relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                <ellipse cx="100" cy="165" rx="85" ry="12" fill="#141E3C" />
                <rect x="55" y="140" width="90" height="8" rx="3" fill="#3B82F6" />
                <rect x="65" y="85" width="70" height="55" rx="4" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
                <line x1="73" y1="98" x2="95" y2="98" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="73" y1="106" x2="115" y2="106" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="73" y1="114" x2="105" y2="114" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="73" y1="122" x2="88" y2="122" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="50" r="16" fill="#F87171" />
                <path d="M82 82 C82 66, 118 66, 118 82 L122 135 L78 135 Z" fill="#2563EB" />
                <path d="M84 48 C84 32, 116 32, 116 48 C110 40, 90 40, 84 48 Z" fill="#1E1B4B" />
                <circle cx="145" cy="70" r="14" fill="#059669" />
                <text x="145" y="74" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">JS</text>
                <circle cx="55" cy="70" r="14" fill="#2563EB" />
                <text x="55" y="74" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">HTML</text>
              </svg>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Test your technical skills across HTML, CSS, and JavaScript with timed single assessments and real-time multiplayer tournaments.
            </p>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
            Official QuizMaster Authentication
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
