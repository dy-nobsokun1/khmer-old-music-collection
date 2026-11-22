"use client";
import { useTranslation } from "./LanguageProvider.js";

export default function LanguageToggle() {
  const { language, changeLanguage, pending } = useTranslation();
  return (
    <div className="language-toggle" role="group"
      aria-label={language === "km" ? "ជ្រើសរើសភាសា" : "Choose language"}
      aria-busy={pending}>
      <button type="button" lang="en" aria-label="English"
        aria-pressed={language === "en"} disabled={pending}
        onClick={() => changeLanguage("en")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" />
        </svg>
        ENG
      </button>
      <button type="button" lang="km" aria-label="ភាសាខ្មែរ"
        aria-pressed={language === "km"} disabled={pending}
        onClick={() => changeLanguage("km")}>ខ្មែរ</button>
    </div>
  );
}
