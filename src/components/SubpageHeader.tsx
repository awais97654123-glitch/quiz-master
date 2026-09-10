"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, User, Shield, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  backUrl?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function SubpageHeader({
  title,
  subtitle,
  badge,
  backUrl,
  onBack,
  actions,
}: SubpageHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("codequiz_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/85 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="group flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-background/80 hover:bg-academic-blue/10 hover:border-academic-blue/40 text-muted-foreground hover:text-academic-blue transition-all cursor-pointer shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate tracking-tight">
                {title}
              </h1>
              {badge && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-academic-blue/10 text-academic-blue border border-academic-blue/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Custom Actions & User Status */}
        <div className="flex items-center gap-2.5">
          {actions}

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background/60 hover:bg-card hover:border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            title="Return to Main Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-card border border-border hover:border-academic-blue/40 transition-all text-xs font-medium text-foreground"
            >
              <div className="w-6 h-6 rounded-full bg-academic-blue/15 text-academic-blue flex items-center justify-center font-bold text-[11px]">
                {user.profile?.name?.[0] || user.email?.[0] || "U"}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">
                {user.profile?.name || user.email?.split("@")[0]}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
