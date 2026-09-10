"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Check, Sparkles, Loader2 } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false,
}: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<
    Array<{ name: string; email: string; avatarColor: string }>
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    // Load saved accounts from localStorage or default to Malik Abubakar
    const savedEmail = localStorage.getItem("last_google_email");
    const savedName = localStorage.getItem("last_google_name");

    const accounts = [
      {
        name: savedName || "Malik Abubakar",
        email: savedEmail || "malikabubakkar523@gmail.com",
        avatarColor: "bg-purple-600",
      },
    ];

    setRecentAccounts(accounts);
    setSelectedEmail(null);
    setShowCustomInput(false);
    setCustomEmail("");
    setCustomName("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccountClick = async (email: string, name: string) => {
    setSelectedEmail(email);
    localStorage.setItem("last_google_email", email);
    localStorage.setItem("last_google_name", name);
    await onSelectAccount(email, name);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) return;

    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || email.split("@")[0];

    setSelectedEmail(email);
    localStorage.setItem("last_google_email", email);
    localStorage.setItem("last_google_name", name);
    await onSelectAccount(email, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Google G Logo */}
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose an account for Quiz Master Arena
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Signing in as {selectedEmail}...
              </p>
              <p className="text-xs text-slate-400">Setting up your Arena session</p>
            </div>
          ) : (
            <>
              {/* List of Accounts */}
              <div className="space-y-2">
                {recentAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleAccountClick(account.email, account.name)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-base shadow-sm">
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {account.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {account.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Continue &rarr;
                    </span>
                  </button>
                ))}

                {/* Add Another Account Toggle */}
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full text-left p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all flex items-center gap-3.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Use another Google account</div>
                      <div className="text-xs text-slate-400">Enter a different email</div>
                    </div>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomSubmit}
                    className="p-4 rounded-2xl border border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Enter your Google Account:
                    </div>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
                      >
                        Continue with Account
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Browser OAuth option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Prefer Google account page?</span>
                <a
                  href="/api/auth/google"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Official Google OAuth &rarr;
                </a>
              </div>

              {/* Google Disclaimer */}
              <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
                To continue, Google will share your name, email address, and profile picture with
                Quiz Master Arena.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
