"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  auth,
  isFirebaseConfigured,
  googleProvider,
  signInWithPopup,
} from "@/lib/firebase";
import { DashboardShell } from "@/components/DashboardShell";
import {
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  User,
  School,
  Save,
  Check,
} from "lucide-react";
import { triggerGlobalLoading } from "@/lib/loading-context";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("codequiz_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        setName(u.profile?.name || "");
        setInstitution(u.profile?.institution || "");
        setBio(u.profile?.bio || "");
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    triggerGlobalLoading(true, "Updating profile...");

    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          institution: institution.trim(),
          bio: bio.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...currentUser,
          profile: data.profile,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("codequiz_user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth_state_changed"));
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsSaving(false);
      triggerGlobalLoading(false);
    }
  };

  return (
    <DashboardShell activePath="/profile/settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Account Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your personal information, authentication methods, and preferences
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[#1D4ED8] text-xs font-bold self-start">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Profile</span>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Information Form */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#1D4ED8] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Personal Information</h2>
              <p className="text-xs text-muted-foreground">Your display identity across quizzes and leaderboards</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahsan Khan"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Institution / University
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Govt. College Lahore"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Academic Bio / Tagline
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your frontend goals, interests, or experience..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Connected Authentication Providers */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Authentication Methods</h2>
              <p className="text-xs text-muted-foreground">Manage sign-in options linked to your QuizMaster account</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Email & Password */}
            <div className="p-4 rounded-xl border border-border/70 bg-background flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">Email & Password</span>
                  <span className="text-xs text-muted-foreground block truncate">
                    {currentUser?.email || "Primary login method"}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>

            {/* Google Account */}
            <div className="p-4 rounded-xl border border-border/70 bg-background flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
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
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">Google Account</span>
                  <span className="text-xs text-muted-foreground block">
                    One-click single sign-on via Firebase Auth
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#1D4ED8]">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
