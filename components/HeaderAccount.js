"use client";
import Link from "next/link";
import { useTranslation } from "./LanguageProvider.js";

export default function HeaderAccount({ signedIn }) {
  const { t } = useTranslation();
  return signedIn ? (
    <div className="header-account">
      <Link href="/contribute" className="header-primary-action">{t("Add a record")}</Link>
    </div>
  ) : (
    <div className="header-account">
      <Link href="/login" className="header-text-action">{t("Log in")}</Link>
      <Link href="/signup" className="header-primary-action">{t("Sign up")}</Link>
    </div>
  );
}
