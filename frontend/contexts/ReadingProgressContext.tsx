"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ReadingProgressContext = createContext(0);

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrollTop / total) * 100) : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <ReadingProgressContext.Provider value={progress}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
