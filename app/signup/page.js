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
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      // Deliberately unspecific, mirroring the login page's restraint.
      setError("That sign-up failed. Check your details and try again.");
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