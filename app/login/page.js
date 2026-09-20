"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "../../components/AuthCard.js";
import { createClient } from "../../utils/supabase/client.js";

// Sign-in page. Authenticates with Supabase email/password. Any failed attempt
// — wrong password, unknown email, unconfirmed account — shows the same generic
// message so we never leak which half of the credentials was wrong.
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(email, password) {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("Invalid email or password");
      return;
    }
    // The session cookie is now written. Refresh so the server components see
    // the new session, then head back to the home page.
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard
      kicker="CONTRIBUTOR ACCESS"
      title="Sign in"
      subtitle="Log in to manage your contributions to the archive."
      submitLabel="Sign in"
      error={error}
      footerHref="/signup"
      footerText="Don't have an account? Create one."
      passwordAutoComplete="current-password"
      onSubmit={login}
    />
  );
}