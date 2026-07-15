import { useEffect, useState, type ReactNode } from "react";
import { ThemeProviderContext, type Theme } from "./theme.context";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const isTheme = (value: string | null): value is Theme =>
  value === "dark" || value === "light" || value === "system";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "notion-clone-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey);
    return isTheme(storedTheme) ? storedTheme : defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme,
    );
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (nextTheme) => {
          localStorage.setItem(storageKey, nextTheme);
          setTheme(nextTheme);
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}
