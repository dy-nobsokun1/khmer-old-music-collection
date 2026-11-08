"use client";
import { useState } from "react";
import { createClient } from "../utils/supabase/client.js";
import ReviewCard from "./ReviewCard.js";
import ArchiveNotice from "./ArchiveNotice.js";
import { cardStyles } from "./reviewStyles.js";

// Shown when a decision could not be made. Bilingual, like the rest of the site.
const FAILURE_MESSAGE =
  "Something went wrong. Please try again. / " +
  "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។";

// The interactive half of the review queue. The server already decided who is a
// reviewer and fetched the pending entries; here Publish and Return call the
// database's own review_entry function and the list updates from whatever it
// reports. Statuses are never written directly: review_entry is the only path.
export default function ReviewBoard({
  initialEntries = [],
  loadError = false,
  emptyMessage = "",
}) {
  const [entries, setEntries] = useState(initialEntries);
  // Ids whose request is still in flight, kept in a Set so a click on one card
  // can never re-enable another card's buttons (no entry gets decided twice).
  const [busy, setBusy] = useState(new Set());
  const [error, setError] = useState("");

  function markIdle(id) {
    setBusy((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function decide(entry, decision) {
    if (busy.has(entry.id)) return;
    setError("");
    setBusy((prev) => new Set(prev).add(entry.id));

    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("review_entry", {
        entry_id: entry.id,
        decision,
      });

      // review_entry returns true only when it acted. Anything else — false,
      // an error, a policy refusal — leaves the entry in the list.
      if (rpcError || data !== true) {
        console.error(
          "[review] review_entry failed:",
          rpcError ? rpcError.message : "returned " + data,
          "(entry " + entry.id + ")"
        );
        setError(FAILURE_MESSAGE);
        markIdle(entry.id);
        return;
      }

      // Success: the entry is no longer pending, so drop it from the list.
      setEntries((list) => list.filter((item) => item.id !== entry.id));
      markIdle(entry.id);
    } catch (caught) {
      console.error("[review] review_entry failed unexpectedly:", caught);
      setError(FAILURE_MESSAGE);
      markIdle(entry.id);
    }
  }

  if (loadError) {
    return (
      <ArchiveNotice>
        Couldn’t load the review queue. Please refresh the page to try again.
      </ArchiveNotice>
    );
  }

  if (entries.length === 0) {
    return <ArchiveNotice>{emptyMessage}</ArchiveNotice>;
  }

  return (
    <>
      {error ? (
        <p style={cardStyles.error} role="alert">
          {error}
        </p>
      ) : null}
      <ul style={cardStyles.list}>
        {entries.map((entry) => (
          <ReviewCard
            key={entry.id}
            entry={entry}
            busy={busy.has(entry.id)}
            onPublish={() => decide(entry, "published")}
            onReturn={() => decide(entry, "returned")}
          />
        ))}
      </ul>
    </>
  );
}