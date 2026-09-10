"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Building,
  Edit3,
  Award,
  BookOpen,
  PlusCircle,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  Save,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { formatPercentage, formatTime } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    quizzesTaken: 0,
    quizzesCreated: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login?redirect=/profile");
      return;
    }

    const storedUser = localStorage.getItem("codequiz_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.profile) setProfile(u.profile);
      } catch {
        // ignore
      }
    }

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data.profile);
        if (data.user) {
          setCurrentUser((prev: any) => ({ ...prev, ...data.user }));
        }
        
        const historyAttempts = data.history || data.attempts || [];
        setAttempts(historyAttempts);
        setCreatedQuizzes(data.createdQuizzes || []);

        const taken = data.stats?.totalQuizzes ?? historyAttempts.length;
        const created = data.stats?.quizzesCreated ?? (data.createdQuizzes?.length || 0);
        const totalScore = historyAttempts.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
        const avg = data.stats?.averageScore || 0;

        setStats({
          totalQuizzes: taken + created,
          quizzesTaken: taken,
          quizzesCreated: created,
          totalScore: totalScore,
          averageScore: avg,
        });

        setEditName(data.profile?.name || "");
        setEditInstitution(data.profile?.institution || "");
        setEditBio(data.profile?.bio || "");
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem("codequiz_token");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          institution: editInstitution,
          bio: editBio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsEditing(false);

        const stored = localStorage.getItem("codequiz_user");
        if (stored) {
          const u = JSON.parse(stored);
          u.profile = data.profile;
          localStorage.setItem("codequiz_user", JSON.stringify(u));
        }
        window.dispatchEvent(new Event("auth_state_changed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.name || currentUser?.profile?.name || currentUser?.name || (currentUser?.email ? currentUser.email.split("@")[0] : "Student Member");
  const displayEmail = currentUser?.email || profile?.user?.email || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("codequiz_user") || "{}").email : "") || "student@arena.edu";
  const displayInstitution = profile?.institution || currentUser?.profile?.institution || "Independent Learner";
  const displayBio = profile?.bio || currentUser?.profile?.bio || "Preparing and excelling across computer science & web development challenges.";
  const displayAvatar = profile?.avatarUrl || currentUser?.profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <DashboardShell activePath="/profile">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        
        {/* Header matching Screen 3: "My Profile" with "Edit Profile" Button */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            My Profile
          </h1>

          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* User Profile Card matching Screen 3 */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-500/20 bg-slate-100 dark:bg-slate-900 object-cover shadow-md"
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                title="Update Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Info Details matching Screen 3 */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Name
                  </span>
                  <span className="font-semibold text-foreground text-sm">{displayName}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    School / College / University
                  </span>
                  <span className="font-semibold text-foreground text-sm">{displayInstitution}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Bio
                  </span>
                  <span className="text-muted-foreground font-medium">{displayBio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Stat Cards matching Screen 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Quizzes Taken */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs text-center space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Quizzes Taken
            </span>
            <span className="text-3xl sm:text-4xl font-black text-foreground">
              {stats.quizzesTaken}
            </span>
          </div>

          {/* Card 2: Quizzes Created */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs text-center space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Quizzes Created
            </span>
            <span className="text-3xl sm:text-4xl font-black text-foreground">
              {stats.quizzesCreated}
            </span>
          </div>

          {/* Card 3: Total Score */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs text-center space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Total Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
              {stats.totalScore}
            </span>
          </div>
        </div>

        {/* Recent Quizzes Activity Table */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Recent Assessment History</h3>
            <Link
              href="/history"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All History
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No recent quiz attempts found. Start your first quiz today!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {attempts.slice(0, 5).map((att) => (
                <div key={att.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-sm text-foreground">{att.quiz?.name || "Exam Session"}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(att.submittedAt || att.startedAt).toLocaleDateString()} • Score: {att.score}/{att.totalQuestions || 10}
                    </p>
                  </div>

                  <Link
                    href={`/quiz/result/${att.id}`}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Edit Profile Information</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  School / College / University
                </label>
                <input
                  type="text"
                  required
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
