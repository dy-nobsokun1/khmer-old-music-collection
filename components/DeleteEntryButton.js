"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";
import { styles } from "./contributeStyles.js";

// Delete control for an entry, shown only to the entry's owner.
//
// Deleting is permanent and there is no undo, so this asks first with a two-step
// inline confirmation rather than firing on the first click: the button becomes
// a Yes/Cancel pair. window.confirm is deliberately avoided -- it cannot be
// styled to match the archive and it blocks the whole page.
//
// Hiding this button is a courtesy, not a safeguard. The real protection is the
// delete policy in db/002_entries_owner_policies.sql: a request for somebody
// else's row returns nothing, which is exactly what the check below reports.
export default function DeleteEntryButton({ entryId, entryTitle }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: deleteError } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId)
        .select();

      if (deleteError) {
        console.error(
          "[entry] delete failed:",
          deleteError.code,
          deleteError.message
        );
        setError("That change wasn't saved.");
        setBusy(false);
        return;
      }

      // .select() asks for the rows the delete actually removed (DELETE ...
      // RETURNING). An empty result means the row was not there, or a security
      // policy blocked it, so nothing was deleted -- saying so is the honest
      // outcome rather than pretending it worked.
      if (!data || data.length === 0) {
        console.error("[entry] delete returned no rows for id", entryId);
        setError("That change wasn't saved.");
        setBusy(false);
        return;
      }

      // The entry is gone, so this page no longer exists. Back to the archive.
      router.push("/");
      router.refresh();
    } catch (caught) {
      console.error("[entry] delete failed unexpectedly:", caught);
      setError("That change wasn't saved.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={styles.dangerButton}
      >
        Delete
      </button>
    );
  }

  return (
    <span style={styles.confirmRow}>
      <span style={styles.confirmText}>
        Delete this record permanently?
      </span>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        style={styles.cancelButton}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        style={busy ? { ...styles.dangerButton, opacity: 0.6 } : styles.dangerButton}
      >
        {busy ? "Deleting…" : `Yes, delete${entryTitle ? "" : " it"}`}
      </button>
      {error ? (
        <span style={styles.dangerError} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}