import { createClient } from "../../utils/supabase/server.js";
import ContributionForm from "../../components/ContributionForm.js";
import { styles } from "../../components/contributeStyles.js";

// The add-an-entry page. A Server Component, so the signed-in check happens
// before any form HTML is produced.
//
// The check here is a gate, not a lock: a logged-out visitor never receives the
// form, only the prompt to log in. What actually protects the entries table is
// the row-level security policy on Supabase (insert allowed only where
// owner = auth.uid()), which this code cannot enforce on its own. Defence in
// depth: the page hides the form, the insert names its columns, and RLS makes
// the row belong to the person who saved it.
export default async function ContributePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>ADD AN ENTRY</p>
          <h1 style={styles.title}>Log in to contribute</h1>
          <p style={styles.sub}>
            Contributing a record means signing in first, so the archive knows
            who to credit. It only takes a moment — and your entries stay yours
            to edit later.
          </p>
          <div style={styles.form}>
            <p style={styles.hint}>
              Already have an account?{" "}
              <a href="/login" style={styles.backInline}>
                Log in
              </a>
              . New here?{" "}
              <a href="/signup" style={styles.backInline}>
                Create one
              </a>
              .
            </p>
            <a href="/" style={styles.buttonLink}>
              Back to the archive
            </a>
          </div>
        </div>
      </main>
    );
  }

  // The user's id is handed to the form purely so it can name the upload path and
  // stamp owner on the row. It comes from the session, never from the browser.
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <p style={styles.kicker}>ADD AN ENTRY</p>
        <h1 style={styles.title}>Contribute a record</h1>
        <p style={styles.sub}>
          {`Filing a record with ${user.email}. Everything marked * is required — the
          photo in particular, since a record card needs something to show.`}
        </p>

        <ContributionForm userId={user.id} />

        <p style={styles.hint}>
          Changed your mind?{" "}
          <a href="/" style={styles.backInline}>
            Back to the archive
          </a>
        </p>
      </div>
    </main>
  );
}