import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fa" | "en";

/** Pick the text for the active language, falling back to the other language when empty. */
export function pickLang(lang: Lang, fa: string | null | undefined, en: string | null | undefined) {
  const a = (fa ?? "").trim();
  const b = (en ?? "").trim();
  return lang === "fa" ? a || b : b || a;
}

type LangContextValue = {
  lang: Lang;
  isFa: boolean;
  toggle: () => void;
  t: (fa: string | null | undefined, en: string | null | undefined) => string;
};

const LangContext = createContext<LangContextValue | null>(null);
const STORAGE_KEY = "portfolio-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fa");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fa") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "fa" ? "en" : "fa")), []);
  const t = useCallback(
    (fa: string | null | undefined, en: string | null | undefined) => pickLang(lang, fa, en),
    [lang],
  );

  const value = useMemo(() => ({ lang, isFa: lang === "fa", toggle, t }), [lang, toggle, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
