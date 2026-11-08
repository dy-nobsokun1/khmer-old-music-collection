import { createClient } from "../../utils/supabase/server.js";
import ReviewBoard from "../../components/ReviewBoard.js";
import { styles } from "../../components/contributeStyles.js";

// The review queue: pending submissions, one per card, each with a Publish
// and a Return decision.
//
// Security: the reviewer check runs here on the server and the page returns
// before a line of entry data is rendered or fetched for anyone who is not a
// reviewer. The query never selects `owner`, so a contributor's identity does
// not reach the browser. Status changes go through the database's own
// review_entry function; nothing in this page writes to the entries table.
export default async function ReviewPage() {
  const supabase = await createClient();

  const { data: isReviewer, error: reviewerError } = await supabase.rpc(
    "is_reviewer"
  );

  // Not a reviewer (or the check itself failed): show the notice and stop.
  if (reviewerError || isReviewer !== true) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>REVIEW</p>
          <h1 style={styles.title}>Reviews</h1>
          <p style={styles.sub}>
            Access Denied. This page is only available to authorized reviewers.
          </p>
          <p style={styles.sub}>
            មិនអនុញ្ញាតឱ្យចូលប្រើទេ។ ទំព័រនេះសម្រាប់តែអ្នកត្រួតពិនិត្យដែលមានសិទ្ធិប៉ុណ្ណោះ។
          </p>
          <p style={styles.hint}>
            <a href="/" style={styles.backInline}>Back to the archive</a>
          </p>
        </div>
      </main>
    );
  }

  // Oldest first, so the submission that has waited longest is reviewed first.
  // Only the columns a reviewer needs are selected; owner is deliberately
  // absent, and status is used as a filter but never shown.
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, created_at, title, artist, release_year, genre, duration, vinyl_image"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  return (
    <main style={styles.page}>
      <p style={styles.kicker}>REVIEW QUEUE</p>
      <h1 style={styles.title}>Pending submissions</h1>
      <p style={styles.sub}>
        Approve a song for the public archive, or send it back for corrections.
      </p>

      <ReviewBoard
        initialEntries={error ? [] : (data || [])}
        loadError={Boolean(error)}
        emptyMessage={
          "No pending entries. All submissions have been reviewed! / " +
          "មិនមានការដាក់ស្នើដែលកំពុងរង់ចាំទេ។ ការដាក់ស្នើទាំងអស់ត្រូវបានពិនិត្យរួចរាល់ហើយ!"
        }
      />

      <p style={styles.pageFooter}>
        <a href="/" style={styles.backInline}>Back to the archive</a>
      </p>
    </main>
  );
}