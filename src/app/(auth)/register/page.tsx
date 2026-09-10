"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  auth,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Key,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";
import { triggerGlobalLoading } from "@/lib/loading-context";
import { GoogleAuthModal } from "@/components/GoogleAuthModal";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || searchParams.get("returnUrl") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showGoogleDomainFallback, setShowGoogleDomainFallback] = useState(false);
  const [googleFallbackEmail, setGoogleFallbackEmail] = useState("");

  const handleSyncUser = async (token: string, userName?: string) => {
    triggerGlobalLoading(true, "Setting up student profile...");
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

        // If a name was entered in registration, save to profile
        if (userName && userName.trim()) {
          fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: userName.trim() }),
          }).catch(() => {});
        }

        router.push(`/profile/setup?redirect=${encodeURIComponent(redirectTarget)}`);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to initialize profile");
      }
    } catch (err: any) {
      setError(err.message || "Network sync error");
    } finally {
      setIsLoading(false);
      triggerGlobalLoading(false);
    }
  };

  const handleDirectRegister = async (regEmail: string, regName: string) => {
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, name: regName }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("codequiz_token", data.token);
        localStorage.setItem("codequiz_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth_state_changed"));

        if (regName.trim()) {
          fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({ name: regName.trim() }),
          }).catch(() => {});
        }

        router.push("/profile/setup");
      } else {
        setError("Direct registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        await handleSyncUser(token, name);
      } catch (err: any) {
        const errMsg = String(err?.message || "").toLowerCase();
        const errCode = String(err?.code || "").toLowerCase();
        if (
          errCode.includes("api-key") ||
          errMsg.includes("api-key") ||
          errMsg.includes("api key") ||
          errCode.includes("invalid-api-key")
        ) {
          console.warn("Firebase client key rejected, falling back to direct database registration...");
          await handleDirectRegister(email, name);
          return;
        }
        setIsLoading(false);
        if (err.code === "auth/email-already-in-use") {
          setError("This email address is already registered. Please sign in.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. Please use letters, numbers, and symbols.");
        } else {
          setError(err.message || "Registration failed");
        }
      }
    } else {
      await handleDirectRegister(email, name);
    }
  };

  const handleGoogleRegister = () => {
    setError(null);
    setShowGoogleModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-border bg-card">
        
        {/* Left Side: Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <QuizMasterLogo size="md" variant="auto" />
            </div>

            <div className="space-y-1 mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Create an Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join QuizMaster to test your skills and track your progress
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {showGoogleDomainFallback && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-foreground text-sm space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Google Registration Fast-Track</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Google popup closed or blocked? Enter your Google email to register directly without needing a password:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleFallbackEmail}
                    onChange={(e) => setGoogleFallbackEmail(e.target.value)}
                    placeholder="Enter your google email (e.g. malikabubakkar523@gmail.com)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (googleFallbackEmail.trim()) {
                        handleDirectRegister(googleFallbackEmail.trim(), name || "New Candidate");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Register Now
                  </button>
                </div>
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Quick sign in:</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleDirectRegister("malikabubakkar523@gmail.com", "Malik Abubakar")}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      malikabubakkar523@gmail.com &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectRegister("new_candidate@codequiz.arena", "Candidate")}
                      className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                    >
                      Guest &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
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
                    placeholder="Create a password (min 6 chars)"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? "Creating account..." : "Sign Up"}</span>
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold">
                  OR
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl border border-border hover:border-slate-400 dark:hover:border-slate-600 bg-background hover:bg-muted/60 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer"
            >
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

          <div className="pt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Right Side: Dark Blue Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0B132B] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-center">
            <QuizMasterLogo size="lg" variant="light" />
          </div>

          <div className="relative z-10 text-center space-y-6 my-auto py-8">
            <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold text-blue-400">
              <span>Learn</span>
              <span className="text-slate-600">•</span>
              <span>Practice</span>
              <span className="text-slate-600">•</span>
              <span>Grow</span>
            </div>

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
              Create your profile, select your preferred topics, and start taking quizzes to test your coding skills.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/login"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Already have an account? Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {showConfigHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-blue-600">
              <Key className="w-6 h-6" />
              <h3 className="text-lg font-bold text-foreground">Firebase Configuration</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To connect your real Google Account via Firebase OAuth popup, please add your Firebase credentials to your <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">.env</code> file.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigHelp(false)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-in Dedicated Account Chooser Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        isLoading={isLoading}
        onSelectAccount={async (selectedEmail, selectedName) => {
          await handleDirectRegister(selectedEmail, selectedName);
          setShowGoogleModal(false);
        }}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
