import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server.js";

// Email-confirmation callback. Supabase points the confirmation link in the
// emailed message at this route (via the project's Redirect URLs). The link
// carries a one-time PKCE code; we exchange it for a real session, which
// writes the auth cookies. Only a verified email account may proceed.
// Runs as a Route Handler on the server, so it can set cookies.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const destination = new URL("/", origin);
  try {
    const next = new URL(searchParams.get("next") || "/", origin);
    if (next.origin === origin) destination.href = next.href;
  } catch {
    // Invalid destinations fall back to the archive home page.
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fetch the verified user from Supabase, never from URL parameters or
      // browser metadata. Opening this route alone cannot confirm an email.
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!userError && user?.email_confirmed_at) {
        return NextResponse.redirect(destination);
      }
      await supabase.auth.signOut({ scope: "local" });
    } else {
      console.error(
        "[auth/confirm] exchangeCodeForSession failed:",
        error.code,
        error.message
      );
    }
  }

  // No code, or the exchange failed - send the user somewhere they can retry.
  return NextResponse.redirect(new URL("/login?error=email_confirmation", origin));
}
