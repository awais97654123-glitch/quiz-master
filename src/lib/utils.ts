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

/**
 * Robustly sanitizes room codes:
 * Strips URLs (http://.../join/12345678), prefixes (#, PIN:, CODE:),
 * whitespace, and hyphens.
 */
export function sanitizeRoomCode(raw: string): string {
  if (!raw) return "";
  let clean = decodeURIComponent(raw).trim();

  // Extract from URL if full URL or path was pasted
  if (clean.includes("/join/")) {
    clean = clean.split("/join/")[1].split(/[?#]/)[0];
  } else if (clean.includes("/room/")) {
    clean = clean.split("/room/")[1].split(/[?#]/)[0];
  }

  // Strip common room prefixes: #, pin:, code:, room-code-, room:
  clean = clean.replace(/^(pin|code|room-code|room)[:\s-]+/i, "").replace(/^#+/, "").trim();

  // If an 8-digit (or 6-8 digit) room code is found, extract it directly
  const digitsMatch = clean.match(/\b\d{6,8}\b/);
  if (digitsMatch) {
    return digitsMatch[0];
  }

  // If code is numeric or alphanumeric, strip remaining spaces & hyphens
  if (/^[A-Za-z0-9\s-]+$/.test(clean) && clean.replace(/[\s-]/g, "").length >= 4) {
    clean = clean.replace(/[\s-]/g, "");
  }

  return clean;
}

