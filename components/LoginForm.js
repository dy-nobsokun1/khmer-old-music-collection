"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "./AuthCard.js";
import { useTranslation } from "./LanguageProvider.js";
import { createClient } from "../utils/supabase/client.js";
import { rememberAccount } from "../utils/savedAccounts.js";

export default function LoginForm({ initialEmail }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(email, password) {
    setError("");
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.code === "email_not_confirmed"
          ? "Confirm your email before signing in."
          : "Invalid email or password");
        return;
      }
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut({ scope: "local" });
        setError("Confirm your email before signing in.");
        return;
      }
      rememberAccount(data.user?.email);
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
    }
  }

  return (
    <AuthCard
      kicker={t("CONTRIBUTOR ACCESS")}
      title={t("Sign in")}
      subtitle={t(initialEmail ? "Sign in to switch to this account." : "Log in to manage your contributions to the archive.")}
      initialEmail={initialEmail}
      submitLabel={t("Sign in")}
      error={error}
      footerHref="/signup"
      footerText={t("Don't have an account? Create one.")}
      passwordAutoComplete="current-password"
      onSubmit={login}
    />
  );
}
