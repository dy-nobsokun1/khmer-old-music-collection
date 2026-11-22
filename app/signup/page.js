"use client";
import { useTranslation } from "../../components/LanguageProvider.js";
import { useState } from "react";
import AuthCard from "../../components/AuthCard.js";
import { createClient } from "../../utils/supabase/client.js";

// Supabase must require email confirmation; signup never navigates into the app.
export default function SignupPage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function signup(email, password) {
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      // emailRedirectTo points Supabase's confirmation link at our
      // /auth/confirm route (instead of the Site URL default) so the PKCE
      // exchange always completes in-app. Built from the current origin.
      const emailRedirectTo = `${window.location.origin}/auth/confirm`;
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });
      if (authError) {
        // Deliberately unspecific, mirroring the login page's restraint.
        setError("That sign-up failed. Check your details and try again.");
        // Dev-only: the real reason is deliberately hidden from visitors,
        // but logging it lets us diagnose bad keys, allowlists, rate
        // limits, and already-registered emails without changing what the
        // user sees.
        console.error(
          "[signup] Supabase signUp failed:",
          authError.code,
          authError.message
        );
        return;
      }
      if (data.session) {
        // An immediate session means confirmation is disabled in Supabase.
        await supabase.auth.signOut({ scope: "local" });
        setError("Email confirmation is unavailable. Please contact the archive curator.");
        return;
      }
      setNotice(email);
    } catch (caught) {
      // A thrown error (for example createClient failing because an env var
      // is missing on this deployment) should not leave the form silently
      // broken. Surface the same guarded message and log the cause.
      console.error("[signup] unexpected failure:", caught);
      setError("That sign-up failed. Check your details and try again.");
    }
  }

  return (
    <AuthCard
      kicker={t("JOIN THE ARCHIVE")}
      title={t(notice ? "Check your email" : "Create an account")}
      subtitle={t(notice ? "Confirm your email before signing in." : "Sign up to submit and manage your own entries.")}
      submitLabel={t("Create account")}
      error={error}
      notice={notice ? t("If this email is new, check your inbox at {email} to confirm your account. If you already confirmed it, sign in.", { email: notice }) : ""}
      footerHref="/login"
      footerText={t("Already have an account? Sign in.")}
      passwordAutoComplete="new-password"
      onSubmit={signup}
    />
  );
}
