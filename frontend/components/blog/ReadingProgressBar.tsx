"use client";

import { useReadingProgress } from "@/contexts/ReadingProgressContext";

export function ReadingProgressBar() {
  const progress = useReadingProgress();
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary/70 transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
