"use client";

import { QuizMasterIcon } from "@/components/QuizMasterIcon";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none bg-[#f8fafc]/90 dark:bg-[#040714]/90 backdrop-blur-sm transition-colors duration-200">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-subtle-float">
          <QuizMasterIcon size={56} withGlow={true} />
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
