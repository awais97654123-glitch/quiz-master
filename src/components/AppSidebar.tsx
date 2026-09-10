"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  Trophy,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";
import { useTheme } from "@/lib/theme-context";
import { signOutUser } from "@/lib/firebase";

interface AppSidebarProps {
  activePath?: string;
}

export function AppSidebar({ activePath }: AppSidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem("codequiz_token");
    localStorage.removeItem("codequiz_user");
    window.dispatchEvent(new Event("auth_state_changed"));
    router.push("/login");
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home, exact: true },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Quizzes", href: "/history", icon: BookOpen },
    { label: "Create Quiz", href: "/quiz/create/setup", icon: PlusCircle },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/profile/settings", icon: Settings },
  ];

  const isItemActive = (itemHref: string, exact?: boolean) => {
    if (exact) return currentPath === itemHref;
    if (itemHref === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/");
    }
    return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B132B] text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800/80 select-none transition-colors duration-200">
      {/* Top Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <QuizMasterLogo size="md" />
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href, item.exact);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls: Theme Toggle & Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Toggle</span>
        </button>

        {user && (
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user.profile?.name?.[0] || user.email?.[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.profile?.name || user.email?.split("@")[0] || "Student"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.email || "Active Candidate"}
              </p>
            </div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0B132B] border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2">
          <QuizMasterLogo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200"
          >
            {theme === "dark" ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
