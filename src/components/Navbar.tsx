"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  PlusCircle,
  Sun,
  Moon,
  ArrowRight,
  Search,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";
import { useTheme } from "@/lib/theme-context";
import { signOutUser } from "@/lib/firebase";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Hide only on immersive active exam sessions
  if (
    pathname.startsWith("/live/") ||
    (pathname.startsWith("/quiz/single/") && pathname !== "/quiz/single/setup") ||
    pathname.startsWith("/room/") ||
    pathname.startsWith("/quiz/result/")
  ) {
    return null;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
    name?: string;
    username?: string;
    avatarUrl?: string | null;
  } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("codequiz_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }

    const handleStorageChange = () => {
      const u = localStorage.getItem("codequiz_user");
      setUser(u ? JSON.parse(u) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth_state_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth_state_changed", handleStorageChange);
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    localStorage.removeItem("codequiz_user");
    localStorage.removeItem("codequiz_token");
    window.dispatchEvent(new Event("auth_state_changed"));
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/", label: "Home", isActive: pathname === "/" },
    { href: "/quiz", label: "Quizzes", isActive: pathname === "/quiz" || pathname.startsWith("/quiz/") && !pathname.includes("setup") },
    { href: "/topics", label: "Topics", isActive: pathname.startsWith("/topics") },
    { href: "/online-test", label: "Online Tests", isActive: pathname.startsWith("/online-test") },
    { href: "/dashboard", label: "Dashboard", isActive: pathname.startsWith("/dashboard") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#060919]/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-2xl dark:shadow-black/50 transition-colors duration-250">
      {/* Full-width container with generous, comfortable height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 transition-transform hover:opacity-90">
          <QuizMasterLogo size="md" />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative py-2 transition-colors duration-200 group ${
                link.isActive
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {/* Blue & cyan underline on active item */}
              {link.isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Auth & Controls */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Quick PIN Search Button */}
          <Link
            href="/join"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
            title="Join Room with PIN"
          >
            <Search className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Join PIN</span>
          </Link>

          {/* Theme Toggle Button: Moon in Dark Mode, Sun in Light Mode */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={theme === "dark" ? "Dark Mode (Click to switch to Light)" : "Light Mode (Click to switch to Dark)"}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-cyan-300 transition-transform duration-200 hover:-rotate-12" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 transition-all bg-slate-100 dark:bg-[#0E1630] shadow-sm cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[120px] truncate">
                  {user.name || user.username || user.email?.split("@")[0] || "Candidate"}
                </span>
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || "student"}`}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/20 object-cover"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-1" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1026] backdrop-blur-2xl shadow-xl dark:shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || "Student"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || "Active Candidate"}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    My Profile & Stats
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    My Quizzes
                  </Link>
                  <Link
                    href="/quiz/create/setup"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Create Quiz Room
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors border-t border-slate-200 dark:border-white/10 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Login Button */}
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Login
              </Link>

              {/* Get Started Button */}
              <Link
                href="/register"
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white font-black text-xs shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls (Theme Toggle + Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
          >
            {theme === "dark" ? <Moon className="w-4.5 h-4.5 text-cyan-300" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#080D21]/95 backdrop-blur-2xl px-6 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl dark:shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  link.isActive
                    ? "bg-blue-600/15 dark:bg-blue-600/20 text-blue-600 dark:text-white font-bold border-l-2 border-cyan-500 dark:border-cyan-400 pl-4"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/join"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            >
              Join Room with PIN
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
            {user ? (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || "student"}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || "Student"}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-center text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 text-center text-xs font-semibold text-rose-500 dark:text-rose-400 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-xs font-bold text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
