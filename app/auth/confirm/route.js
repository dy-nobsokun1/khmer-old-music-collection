import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server.js";

// Email-confirmation callback. Supabase points the confirmation link in the
// emailed message at this route (via the project's Redirect URLs). The link
// carries a one-time PKCE code; we exchange it for a real session, which
// writes the auth cookies, then send the user home (or wherever next asks).
// Runs as a Route Handler on the server, so it can set cookies.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(origin + next);
    }

    console.error(
      "[auth/confirm] exchangeCodeForSession failed:",
      error.code,
      error.message
    );
  }

  // No code, or the exchange failed - send the user somewhere they can retry.
  return NextResponse.redirect(origin + "/login");
}