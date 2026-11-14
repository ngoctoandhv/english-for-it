"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "efit.theme";

/** Runs before first paint (inline in <head>) so the page never flashes the wrong theme. */
export const themeInitScript = `try{var t=localStorage.getItem("${KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;

type Ctx = { theme: ThemeChoice; resolved: "light" | "dark"; setTheme: (t: ThemeChoice) => void };
const ThemeContext = createContext<Ctx | null>(null);

function apply(choice: ThemeChoice): "light" | "dark" {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  return dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    let saved: ThemeChoice = "system";
    try {
      saved = (localStorage.getItem(KEY) as ThemeChoice | null) ?? "system";
    } catch {
      /* storage unavailable */
    }
    queueMicrotask(() => {
      setThemeState(saved);
      setResolved(apply(saved));
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setThemeState((cur) => (cur === "system" ? (setResolved(apply("system")), cur) : cur));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t);
    setResolved(apply(t));
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
