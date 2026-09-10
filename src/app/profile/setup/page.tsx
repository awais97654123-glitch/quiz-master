"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Building, AtSign, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const AVATAR_SEEDS = ["Felix", "Aneka", "Jocelyn", "Dustin", "Alex", "Maya", "Leo", "Sam"];

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("Felix");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("codequiz_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.profile?.name) setName(u.profile.name);
        if (u.profile?.username) setUsername(u.profile.username);
        if (u.profile?.institution) setInstitution(u.profile.institution);
        if (u.profile?.bio) setBio(u.profile.bio);
      } catch {
        // ignore
      }
    }
  }, []);

  const selectedAvatarUrl = isCustomAvatar && customAvatarUrl.trim()
    ? customAvatarUrl.trim()
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          username,
          institution,
          bio: bio.trim() ? bio : null,
          avatarUrl: selectedAvatarUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update user state in localStorage
        const stored = localStorage.getItem("codequiz_user");
        if (stored) {
          const u = JSON.parse(stored);
          u.profile = data.profile;
          u.profileCompleted = true;
          localStorage.setItem("codequiz_user", JSON.stringify(u));
        }
        window.dispatchEvent(new Event("auth_state_changed"));
        router.push(redirectTarget);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-academic-blue text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Complete Your Academic Profile
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Set your examination identity, institutional affiliation, and student avatar
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-card border border-border p-7 rounded-2xl shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview & Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Student Avatar
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={selectedAvatarUrl}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-full border-2 border-academic-blue bg-muted shadow-sm object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Select from verified academic avatars:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_SEEDS.map((seed) => {
                      const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                      const isChosen = !isCustomAvatar && avatarSeed === seed;
                      return (
                        <button
                          type="button"
                          key={seed}
                          onClick={() => {
                            setIsCustomAvatar(false);
                            setAvatarSeed(seed);
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                            isChosen
                              ? "border-academic-blue ring-2 ring-academic-blue/30 scale-105"
                              : "border-border hover:border-muted-foreground opacity-75 hover:opacity-100"
                          }`}
                        >
                          <img src={url} alt={seed} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-academic-blue/40 focus:border-academic-blue transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Username (Unique Handle)
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="e.g. alex_dev"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-academic-blue/40 focus:border-academic-blue transition-all"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                School / College / University
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University or MIT"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-academic-blue/40 focus:border-academic-blue transition-all"
                />
              </div>
            </div>

            {/* Bio (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Bio / Specialization (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Frontend enthusiast focusing on responsive layouts and JavaScript architecture..."
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-academic-blue/40 focus:border-academic-blue transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-academic-blue text-white font-semibold text-sm hover:bg-academic-blue/90 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? "Saving Profile..." : "Complete Setup & Enter Arena"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-sm text-muted-foreground">Loading setup...</div>}>
      <ProfileSetupContent />
    </Suspense>
  );
}
