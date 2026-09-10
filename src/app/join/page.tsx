"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Camera,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";

export default function JoinQuizLandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");
  const [roomCode, setRoomCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = roomCode.trim().toUpperCase();
    if (!cleaned) {
      setError("Please enter a valid quiz code");
      return;
    }
    setIsSubmitting(true);
    router.push(`/join/${cleaned}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex flex-col">
      {/* Screen 9 Top Dark Blue Header Banner */}
      <header className="bg-[#0B132B] text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <QuizMasterLogo size="md" variant="light" showText={false} />
              <div>
                <span className="font-black text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  QuizMaster
                </span>
                <span className="block text-[11px] text-blue-200/70 font-medium">
                  Live Assessment Arena
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center sm:text-right">
            <h1 className="text-lg sm:text-xl font-black text-white">
              Join a Quiz
            </h1>
            <p className="text-xs text-blue-200/80">
              Enter the quiz code or scan the QR code to participate
            </p>
          </div>
        </div>
      </header>

      {/* Main Join Container - Screen 9 */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Switcher: [ Enter Code ] | [ Scan QR ] */}
            <div className="flex border-b border-border/70 bg-muted/30">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "code"
                    ? "bg-white dark:bg-[#0E1A38] text-[#1D4ED8] border-b-2 border-[#1D4ED8]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Enter Code</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("qr")}
                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "qr"
                    ? "bg-white dark:bg-[#0E1A38] text-[#1D4ED8] border-b-2 border-[#1D4ED8]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "code" ? (
                /* Tab 1: Enter Code */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center space-y-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Quiz Room Code
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ask your instructor or host for the 8-character code
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. A7F3B9C2"
                      className="w-full text-center text-2xl sm:text-3xl font-mono font-black tracking-widest py-3.5 px-4 rounded-xl bg-background border-2 border-border focus:border-[#1D4ED8] focus:outline-none focus:ring-4 focus:ring-[#1D4ED8]/15 transition-all text-foreground uppercase placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !roomCode.trim()}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-black text-base shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Join Quiz</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tab 2: Scan QR */
                <div className="text-center space-y-6">
                  <div className="relative w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-[#1D4ED8]/40 bg-muted/20 flex flex-col items-center justify-center p-4 overflow-hidden group">
                    <Camera className="w-10 h-10 text-[#1D4ED8] mb-2" />
                    <span className="text-xs font-bold text-foreground">
                      Camera Scanner
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-1">
                      Point camera at host QR code
                    </span>
                    {/* Visual scanline */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1D4ED8] to-transparent animate-pulse" />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Or use your mobile camera app to scan the host screen directly — you will automatically be redirected into the lobby.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
