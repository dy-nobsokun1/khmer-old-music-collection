import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client for Client Components. Runs only in the
// browser and reads/writes the auth session cookies automatically.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
