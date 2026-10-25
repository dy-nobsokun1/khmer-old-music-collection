import { createClient } from "../../utils/supabase/server.js";
import { styles } from "../../components/contributeStyles.js";

// "My entries": the logged-in contributor's own entries, each with its
// status shown in plain words so the owner knows what is published,
// what is still awaiting review, and what came back for revision.
// The filter is owner = the signed-in user, applied in the query rather
// than in the browser. owner is never selected or passed on; it is only
// ever compared against, and that comparison happens here on the server.
export default async function MyEntriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>MY ENTRIES</p>
          <h1 style={styles.title}>Log in to see your entries</h1>
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

  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, created_at, title, slug, artist, release_year, release_date, " +
        "pressing, duration, genre, sub_genres, vinyl_image, theme, vinyl, status"
    )
    .eq("owner", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  const entries = error ? [] : data || [];

  return (
    <main style={styles.page}>
      <p style={styles.kicker}>MY ENTRIES</p>
      <h1 style={styles.title}>Your entries</h1>
      <p style={styles.sub}>
        Records you have contributed. Each one shows its current status.
      </p>

      {entries.length === 0 ? (
        <p style={styles.sub}>You have not added any entries yet.</p>
      ) : (
        <ul style={entryList}>
          {entries.map((entry) => (
            <li key={entry.id} style={entryItem}>
              <a
                href={`/entries/${encodeURIComponent(entry.slug)}`}
                style={entryLink}
              >
                {entry.title}
              </a>
              {entry.artist ? (
                <span style={entryArtist}>{entry.artist}</span>
              ) : null}
              <span style={entryStatus}>{statusLabel(entry.status)}</span>
            </li>
          ))}
        </ul>
      )}

      <p style={styles.pageFooter}>
        <a href="/contribute" style={styles.backInline}>Add a record</a>
        {" \u00b7 "}
        <a href="/" style={styles.backInline}>Back to the archive</a>
      </p>
    </main>
  );
}

function statusLabel(status) {
  const labels = {
    pending: "Pending review / កំពុងរង់ចាំការត្រួតពិនិត្យ",
    published: "Published / បានផ្សព្វផ្សាយ",
    returned: "Returned for revision / បានបញ្ជូនត្រឡប់ដើម្បីកែសម្រួល",
  };
  return labels[status] || status;
}

const entryList = {
  listStyle: "none",
  padding: 0,
  margin: "24px 0 0",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const entryItem = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "12px 16px",
  border: "1px solid #CFBFA1",
  borderRadius: 8,
  backgroundColor: "#F7EEDB",
};

const entryLink = {
  color: "#A65A3C",
  textDecoration: "underline",
  fontSize: 16,
  flex: "1 1 auto",
};

const entryArtist = {
  fontSize: 14,
  color: "#7A6B53",
  flex: "1 1 auto",
};

const entryStatus = {
  fontSize: 13,
  color: "#4A3B2A",
  fontWeight: 500,
  whiteSpace: "nowrap",
};