"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface TimerDisplayProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

export function TimerDisplay({ expiresAt, onExpire, className = "" }: TimerDisplayProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0 && !hasExpired) {
        setHasExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, hasExpired, onExpire]);

  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wide transition-all ${
        secondsRemaining === 0
          ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse"
          : isUrgent
          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
          : "bg-muted/80 border-border text-foreground"
      } ${className}`}
    >
      {isUrgent || secondsRemaining === 0 ? (
        <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-academic-blue" />
      )}
      <span>{formatTime(secondsRemaining)}</span>
      {isUrgent && <span className="text-[10px] uppercase font-sans font-semibold text-rose-500">Ending soon</span>}
    </div>
  );
}
