"use client";
import { useTranslation } from "./LanguageProvider.js";
import { useState } from "react";
import { returnStyles } from "./reviewStyles.js";

const REASON_REQUIRED =
  "Please explain why this entry is being returned. / " +
  "សូមពន្យល់ពីមូលហេតុនៃការបញ្ជូនត្រឡប់។";

// The Return confirmation dialog, opened over the review queue when a reviewer
// clicks Return. The reviewer explains what the contributor needs to correct,
// and only a non-empty reason can confirm the decision. Cancel closes it
// without touching the database, and Confirm locks while the review_entry call
// is in flight so a decision is never sent twice.
export default function ReturnForm({ entry, busy, error, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = note.trim();
  const missing = touched && trimmed.length === 0;

  function confirm() {
    setTouched(true);
    if (!trimmed || busy) return;
    onConfirm(trimmed);
  }

  return (
    <div style={returnStyles.overlay}>
      <div
        style={returnStyles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-dialog-title"
      >
        <h3 id="return-dialog-title" style={returnStyles.heading}>
          {t("Return this submission? / បញ្ជូនការដាក់ស្នើនេះត្រឡប់?")}
        </h3>
        <p style={returnStyles.entryTitle}>
          {entry.title}
          {entry.artist ? " — " + entry.artist : ""}
        </p>

        <label style={returnStyles.label} htmlFor="review-note">
          {t("Reason for Return / មូលហេតុនៃការបញ្ជូនត្រឡប់")}
          <span style={returnStyles.required}> *</span>
        </label>
        <textarea
          id="review-note"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("What should the contributor correct? / តើត្រូវឲ្យអ្នកដាក់ស្នើកែអ្វីខ្លះ?")}
          style={
            missing
              ? { ...returnStyles.textarea, ...returnStyles.invalid }
              : returnStyles.textarea
          }
        />
        {missing ? (
          <p style={{ ...returnStyles.hint, color: "#B3402A" }} role="alert">
            {t(REASON_REQUIRED)}
          </p>
        ) : (
          <p style={returnStyles.hint}>
            {t("A reason is required before confirming. / ទាមទារមូលហេតុមុនពេលបញ្ជាក់។")}
          </p>
        )}

        {error ? (
          <p style={returnStyles.error} role="alert">
            {t(error)}
          </p>
        ) : null}

        <div style={returnStyles.row}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={
              busy
                ? { ...returnStyles.cancel, ...returnStyles.busy }
                : returnStyles.cancel
            }
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy || trimmed.length === 0}
            style={
              busy
                ? { ...returnStyles.confirm, ...returnStyles.busy }
                : returnStyles.confirm
            }
          >
            {busy
              ? t("Returning…")
              : t("Confirm Return / បញ្ជាក់ការបញ្ជូនត្រឡប់")}
          </button>
        </div>
      </div>
    </div>
  );
}