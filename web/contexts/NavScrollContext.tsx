"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface NavScrollState {
  scrollY: number;
  scrolled: boolean;
  visible: boolean;
}

const NavScrollContext = createContext<NavScrollState>({
  scrollY: 0,
  scrolled: false,
  visible: true,
});

export function NavScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      const last = lastY.current;

      if (y > last + 6 && y > 80) {
        setVisible(false);
      } else if (y < last - 4 || y <= 80) {
        setVisible(true);
      }

      setScrollY(y);
      lastY.current = y;
    };

    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <NavScrollContext.Provider value={{ scrollY, scrolled: scrollY > 8, visible }}>
      {children}
    </NavScrollContext.Provider>
  );
}

export function useNavScroll() {
  return useContext(NavScrollContext);
}
