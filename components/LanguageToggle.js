"use client";
import { useTranslation } from "./LanguageProvider.js";

export default function LanguageToggle() {
  const { language, changeLanguage, pending } = useTranslation();
  return (
    <div className="language-bar">
      <div className="language-toggle" role="group"
        aria-label={language === "km" ? "ជ្រើសរើសភាសា" : "Choose language"}
        aria-busy={pending}>
        <button type="button" lang="en" aria-label="English"
          aria-pressed={language === "en"} disabled={pending}
          onClick={() => changeLanguage("en")}>ENG</button>
        <button type="button" lang="km" aria-label="ភាសាខ្មែរ"
          aria-pressed={language === "km"} disabled={pending}
          onClick={() => changeLanguage("km")}>ខ្មែរ</button>
      </div>
    </div>
  );
}
