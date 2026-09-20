import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Session refresh middleware. Runs on every matching request and is the piece
// that actually renews an expired Supabase auth session: Server Components
// cannot write cookies, so the server client (utils/supabase/server.js) has to
// skip its cookie writes. Re-creating a client here from the raw request lets
// us refresh the token and stamp the new cookie onto the response instead.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session if the access token is close to expiring, and
  // writes the refreshed cookie back through supabaseResponse.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export function middleware(request) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on every request except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
