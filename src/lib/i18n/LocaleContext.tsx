"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import en from "./en.json";
import he from "./he.json";

export type Locale = "en" | "he";

const dicts: Record<Locale, Record<string, string>> = { en, he };

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a key, interpolating {varName} placeholders */
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("kidz-locale") as Locale | null;
    if (stored === "en" || stored === "he") setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("kidz-locale", l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = dicts[locale][key] ?? dicts.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t, dir: locale === "he" ? "rtl" : "ltr" }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be inside <LocaleProvider>");
  return ctx;
}
