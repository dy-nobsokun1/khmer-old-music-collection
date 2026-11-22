import { getTranslation } from "../../utils/i18n/server.js";
import { createClient } from "../../utils/supabase/server.js";
import ReviewBoard from "../../components/ReviewBoard.js";
import { styles } from "../../components/contributeStyles.js";

// The review queue: pending submissions, one per card, each with a Publish
// and a Return decision.
//
// Security: the reviewer check runs here on the server and the page returns
// before a line of entry data is rendered or fetched for anyone who is not a
// reviewer. Contributor details come from a separate reviewer-only function;
// owner IDs are never sent to the browser. Status changes go through the database's own
// review_entry function; nothing in this page writes to the entries table.
export default async function ReviewPage() {
  const { t } = await getTranslation();
  const supabase = await createClient();

  const { data: isReviewer, error: reviewerError } = await supabase.rpc(
    "is_reviewer"
  );

  // Not a reviewer (or the check itself failed): show the notice and stop.
  if (reviewerError || isReviewer !== true) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>{t("REVIEW")}</p>
          <h1 style={styles.title}>{t("Reviews")}</h1>
          <p style={styles.sub}>
            {t("Access Denied. This page is only available to authorized reviewers.")}
          </p>
          <p style={styles.hint}>
            <a href="/" style={styles.backInline}>{t("Back to the archive")}</a>
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

  const { data: contributors, error: contributorError } = !error && data?.length
    ? await supabase.rpc("review_contributors")
    : { data: [], error: null };
  const contributorByEntry = new Map(
    (contributors || []).map(({ entry_id, ...contributor }) => [entry_id, contributor])
  );
  const entries = (data || []).map((entry) => ({
    ...entry,
    contributor: contributorByEntry.get(String(entry.id)) || null,
    contributorUnavailable: Boolean(contributorError),
  }));

  return (
    <main style={styles.page}>
      <p style={styles.kicker}>{t("REVIEW QUEUE")}</p>
      <h1 style={styles.title}>{t("Pending submissions")}</h1>
      <p style={styles.sub}>
        {t("Approve a song for the public archive, or send it back for corrections.")}
      </p>

      <ReviewBoard
        initialEntries={error ? [] : entries}
        loadError={Boolean(error)}
        emptyMessage={
          "No pending entries. All submissions have been reviewed! / " +
          "មិនមានការដាក់ស្នើដែលកំពុងរង់ចាំទេ។ ការដាក់ស្នើទាំងអស់ត្រូវបានពិនិត្យរួចរាល់ហើយ!"
        }
      />

      <p style={styles.pageFooter}>
        <a href="/" style={styles.backInline}>{t("Back to the archive")}</a>
      </p>
    </main>
  );
}
