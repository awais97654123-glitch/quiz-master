"use client";

import { Check } from "lucide-react";

interface TopicBadgeProps {
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  count?: number;
}

export function TopicBadge({ name, isSelected, onToggle, count }: TopicBadgeProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isSelected
          ? "bg-academic-blue text-white border-academic-blue shadow-sm shadow-blue-500/20"
          : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
      }`}
    >
      {isSelected && <Check className="w-3.5 h-3.5" />}
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
