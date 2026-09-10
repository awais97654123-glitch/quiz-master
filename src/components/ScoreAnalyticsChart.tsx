"use client";

import React, { useState } from "react";
import { TrendingUp, Award, Clock, ArrowUpRight, BarChart2 } from "lucide-react";

export interface AttemptHistoryItem {
  id: string;
  quiz?: {
    name?: string;
    course?: {
      name?: string;
    };
  };
  score: number;
  totalQuestions?: number;
  percentage?: number;
  accuracy?: number;
  timeTaken?: number;
  submittedAt?: string;
  startedAt?: string;
}

interface ScoreAnalyticsChartProps {
  attempts: AttemptHistoryItem[];
  title?: string;
}

export function ScoreAnalyticsChart({ attempts, title = "Score Trajectory & Performance Analytics" }: ScoreAnalyticsChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Chronological order (oldest to newest) for chart progression
  const chronologicalAttempts = [...attempts]
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.startedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.startedAt || 0).getTime();
      return dateA - dateB;
    })
    .slice(-12); // Last 12 attempts

  if (chronologicalAttempts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">No Performance Analytics Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Complete your first live or solo quiz to unlock real-time score trajectory and skill growth metrics.
          </p>
        </div>
      </div>
    );
  }

  // Calculate coordinates for SVG
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = chronologicalAttempts.map((item, idx) => {
    const pct = Math.min(100, Math.max(0, item.percentage ?? (item.totalQuestions ? Math.round((item.score / item.totalQuestions) * 100) : item.score * 10)));
    const x = chronologicalAttempts.length === 1
      ? width / 2
      : paddingX + (idx / (chronologicalAttempts.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (pct / 100) * chartHeight;
    return { x, y, pct, item, idx };
  });

  // SVG polyline points string
  const polylineStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Closed area for gradient under line
  const areaPath = points.length > 1
    ? `M ${points[0].x},${paddingY + chartHeight} ` +
      points.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
      ` L ${points[points.length - 1].x},${paddingY + chartHeight} Z`
    : "";

  // Performance Trend
  const firstScore = points[0]?.pct || 0;
  const lastScore = points[points.length - 1]?.pct || 0;
  const diff = lastScore - firstScore;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracking examination mastery across your latest {chronologicalAttempts.length} sessions
          </p>
        </div>

        {/* Trend badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              diff >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {diff >= 0 ? `+${diff}% Progression` : `${diff}% Fluctuating`}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            {/* Linear Gradient for Fill Area */}
            <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke Gradient */}
            <linearGradient id="blueStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Filter Glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid lines: 0%, 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = paddingY + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-muted-foreground font-mono"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Fill Path */}
          {areaPath && (
            <path d={areaPath} fill="url(#blueAreaGrad)" />
          )}

          {/* Main Polyline */}
          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="url(#blueStrokeGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
              filter="url(#glow)"
            />
          )}

          {/* Interactive Data Point Dots */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.idx;
            return (
              <g
                key={pt.idx}
                onMouseEnter={() => setHoveredIdx(pt.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-transform"
              >
                {/* Hit target for easier mouse hover */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Outer halo if hovered */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="#06B6D4"
                    fillOpacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* Core dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5" : "4"}
                  fill="#ffffff"
                  stroke={isHovered ? "#06B6D4" : "#2563EB"}
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered / Latest Data Point Detail Inspector */}
      {activePoint && (
        <div className="bg-slate-50 dark:bg-white/[0.03] border border-border/60 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              #{activePoint.idx + 1}
            </div>
            <div>
              <span className="font-bold text-foreground block truncate max-w-[200px] sm:max-w-xs">
                {activePoint.item.quiz?.name || "Quiz Challenge"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(activePoint.item.submittedAt || activePoint.item.startedAt || Date.now()).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Session Score
              </span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-cyan-400">
                {activePoint.pct}% ({activePoint.item.score}/{activePoint.item.totalQuestions || 10})
              </span>
            </div>
            {activePoint.item.timeTaken && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Time
                </span>
                <span className="text-sm font-medium text-foreground">
                  {Math.floor(activePoint.item.timeTaken / 60)}m {activePoint.item.timeTaken % 60}s
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
