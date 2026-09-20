"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "../../components/AuthCard.js";
import { createClient } from "../../utils/supabase/client.js";

// Account creation page. Makes a Supabase user with email/password. When the
// project requires email confirmation (the default for Supabase), we show a
// short message instead of signing straight in; otherwise we land on home.
export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function signup(email, password) {
    setError("");
    setNotice("");
    const supabase = createClient();
    // emailRedirectTo points Supabase's confirmation link at our /auth/confirm
    // route (instead of the Site URL default) so the PKCE exchange always
    // completes in-app. The browser client builds it from the current origin.
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
      // Dev-only: the real reason is deliberately hidden from visitors, but
      // logging it lets us diagnose bad keys, allowlists, rate limits, and
      // already-registered emails without changing what the user sees.
      console.error(
        "[signup] Supabase signUp failed:",
        authError.code,
        authError.message
      );
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setNotice(`Check your inbox at ${email} to confirm your account.`);
  }

  return (
    <AuthCard
      kicker="JOIN THE ARCHIVE"
      title="Create an account"
      subtitle="Sign up to submit and manage your own entries."
      submitLabel="Create account"
      error={error}
      notice={notice}
      footerHref="/login"
      footerText="Already have an account? Sign in."
      passwordAutoComplete="new-password"
      onSubmit={signup}
    />
  );
}