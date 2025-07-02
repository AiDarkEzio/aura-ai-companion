// components/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Theme as PrismaTheme } from "@/app/generated/prisma";
import { updateUserThemePreference } from "@/app/actions/preferences-actions";

// Using the Prisma type ensures consistency
type Theme = PrismaTheme;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {

  const [theme, setThemeState] = useState<Theme>(initialTheme || "SYSTEM");

  useEffect(() => {
    if (initialTheme) {
      return;
    }
    const storedTheme = localStorage.getItem("theme") as Theme | null;

    if (storedTheme && ["LIGHT", "DARK", "SYSTEM"].includes(storedTheme)) {
      setThemeState(storedTheme);
    }
  }, [initialTheme]);
  useEffect(() => {
    const applyTheme = (t: Theme) => {
      if (t === "SYSTEM") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      } else {
        document.documentElement.classList.toggle("dark", t === "DARK");
      }
    };

    applyTheme(theme);

    if (theme === "SYSTEM") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("SYSTEM");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (initialTheme) {
      updateUserThemePreference(newTheme).catch((err) => {
        console.error("Failed to update theme preference:", err);
      });
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
