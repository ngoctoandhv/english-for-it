"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Lang } from "./dictionaries";

const KEY = "efit.lang";

type Params = Record<string, string | number>;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, params?: Params) => string };
const I18nContext = createContext<Ctx | null>(null);

function lookup(lang: Lang, key: string): string | undefined {
  return (dictionaries[lang] as Record<string, string>)[key];
}

/** t("cards", {count: 2}) picks "cards_one" for 1 and "cards_other" otherwise when those keys exist. */
export function translate(lang: Lang, key: string, params?: Params): string {
  let k = key;
  if (params && typeof params.count === "number") {
    const plural = `${key}_${params.count === 1 ? "one" : "other"}`;
    if (lookup(lang, plural) !== undefined || lookup("en", plural) !== undefined) k = plural;
  }
  let text = lookup(lang, k) ?? lookup("en", k) ?? key;
  if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage unavailable */
    }
    const initial: Lang = saved === "vi" || saved === "en" ? saved : navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
    queueMicrotask(() => setLangState(initial));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key: string, params?: Params) => translate(lang, key, params), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
