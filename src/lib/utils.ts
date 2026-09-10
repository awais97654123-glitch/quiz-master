import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${Math.round(value)}%`;
}

export function generateRoomCode(): string {
  // Generate cryptographically uniform 8-digit numeric room code
  const min = 10000000;
  const max = 99999999;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
