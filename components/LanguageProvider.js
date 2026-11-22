"use client";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { translate } from "../utils/i18n/translate.js";

const LanguageContext = createContext(null);

export function useTranslation() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ initialLanguage, children }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function changeLanguage(next) {
    if (pending || next === language || !["en", "km"].includes(next)) return;
    document.cookie = `archive-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLanguage(next);
    startTransition(() => router.refresh());
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, pending,
      t: (text, values) => translate(text, language, values) }}>
      {children}
    </LanguageContext.Provider>
  );
}
