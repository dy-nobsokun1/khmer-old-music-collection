import { createClient } from "../../utils/supabase/server.js";
import { toCard } from "../../components/MusicArchiveFromSupabase.js";
import MusicArchive from "../../components/MusicArchive.js";
import { styles } from "../../components/contributeStyles.js";

// "My Archive": the entries this contributor added, and nothing else.
//
// The filter is owner = the signed-in user, applied in the query rather than in
// the browser, so the list is never assembled from rows a visitor should not
// have. The rows are mapped through the same toCard the public archive uses, so
// a card here is built exactly as it is on the home page.
//
// owner is never selected or passed on. It is only ever compared against, and
// that comparison happens here on the server. What a signed-in user may change
// is still decided by the database, in db/002_entries_owner_policies.sql.
export default async function MyArchivePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>MY ARCHIVE</p>
          <h1 style={styles.title}>Log in to see your archive</h1>
          <p style={styles.sub}>
            Your entries are kept under the account you sign in with, so
            logging in is what shows you this list.
          </p>
          <p style={styles.hint}>
            <a href="/login" style={styles.backInline}>Log in</a>
            {" \u00b7 "}
            <a href="/signup" style={styles.backInline}>Create an account</a>
            {" \u00b7 "}
            <a href="/" style={styles.backInline}>Back to the archive</a>
          </p>
        </div>
      </main>
    );
  }

  // Newest first, with the id as a tiebreaker so two entries sharing a
  // created_at cannot swap places between visits.
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, created_at, title, slug, artist, release_year, release_date, " +
        "pressing, duration, genre, sub_genres, vinyl_image, theme, vinyl"
    )
    .eq("owner", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  return (
    <main style={styles.page}>
      <MusicArchive
        albums={error ? [] : (data || []).map(toCard)}
        error={Boolean(error)}
        kickerLabel="MY ARCHIVE"
        heading="Entries you added"
        description="Records you have contributed to this archive. Open one to edit it or to delete it."
        emptyMessage="You have not added any entries yet. Use Add a record to file the first one."
      />

      <p style={styles.pageFooter}>
        <a href="/contribute" style={styles.backInline}>Add a record</a>
        {" \u00b7 "}
        <a href="/" style={styles.backInline}>Back to the archive</a>
      </p>
    </main>
  );
}