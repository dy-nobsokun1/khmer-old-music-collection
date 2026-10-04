"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EntryFields from "./EntryFields.js";
import uploadVinylImage from "./uploadVinylImage.js";
import { validateEntry, trimValues, toSlug } from "./entryValidation.js";
import { createClient } from "../utils/supabase/client.js";

// The inline edit form on an entry page. Same fields, same hints and the same
// validation rules as /contribute -- both render components/EntryFields.js, so
// there is one definition of what a valid entry looks like.
//
// Two differences from adding an entry:
//   * the photo is optional here, and an untouched picker keeps the current one
//   * the row is updated by id instead of inserted
//
// entry arrives pre-filled from the server, and already has `owner` stripped:
// this form never needs it, because the row is located by id and the database
// decides who is allowed to change it (see db/002_entries_owner_policies.sql).
export default function EditEntryForm({ entry, userId, onCancel }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toFormValues(entry));
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (name, value) =>
    setValues((v) => ({ ...v, [name]: value }));

  const onFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setErrors((e) => ({ ...e, vinyl_image: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setFormError("");

    const trimmed = trimValues(values);
    const slug = toSlug(trimmed.slug);
    // photoRequired false: leaving the file picker empty means "keep the photo
    // this entry already has", not "this entry has no photo".
    const found = validateEntry({ ...trimmed, slug }, file, {
      photoRequired: false,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();

      // Only upload when a new file was actually chosen. If file is null the
      // column is left out of the update entirely, so the stored URL survives.
      const row = {
        title: trimmed.title,
        slug,
        artist: trimmed.artist,
        release_year: trimmed.release_year ? Number(trimmed.release_year) : null,
        release_date: trimmed.release_date || null,
        pressing: trimmed.pressing || null,
        duration: trimmed.duration,
        genre: trimmed.genre,
        sub_genres: trimmed.sub_genres || null,
        theme: trimmed.theme,
        vinyl: trimmed.vinyl === "Yes",
      };
      if (file) row.vinyl_image = await uploadVinylImage(file, userId);

      // owner, id and created_at are deliberately absent: this is an update to
      // an existing row, so those must not change. Columns are named one by one
      // rather than spread, so nothing can slip in from the form state.
      const { data, error } = await supabase
        .from("entries")
        .update(row)
        .eq("id", entry.id)
        .select();

      if (error) {
        console.error(
          "[edit] entry update failed:",
          error.code,
          error.message
        );
        setFormError("That change wasn't saved.");
        setBusy(false);
        return;
      }

      // .select() asks Postgres for the rows it actually changed (UPDATE
      // ... RETURNING). No rows back means the row did not exist or a security
      // policy filtered it out, so the write did not happen -- reporting success
      // here would be a lie.
      if (!data || data.length === 0) {
        console.error(
          "[edit] update returned no rows for id",
          entry.id
        );
        setFormError("That change wasn't saved.");
        setBusy(false);
        return;
      }

      // The slug may have changed, so follow the entry to its new address
      // rather than leaving the address bar pointing at the old slug.
      router.push(`/entries/${encodeURIComponent(slug)}`);
      router.refresh();
      onCancel();
    } catch (caught) {
      console.error("[edit] submission failed:", caught);
      setFormError("That change wasn't saved.");
      setBusy(false);
    }
  }

  return (
    <EntryFields
      values={values}
      errors={errors}
      formError={formError}
      busy={busy}
      onChange={onChange}
      onFileChange={onFileChange}
      onSubmit={submit}
      submitLabel="Save changes"
      busyLabel="Saving…"
      photoRequired={false}
    />
  );
}

// One stored row -> the values the fields expect.
//
// Two columns need converting rather than copying. release_year is a number (or
// null), and the input wants a string or an empty box. vinyl is a boolean in the
// database but a Yes/No question on screen.
function toFormValues(entry) {
  return {
    title: entry.title || "",
    slug: entry.slug || "",
    artist: entry.artist || "",
    release_year: entry.release_year == null ? "" : String(entry.release_year),
    release_date: entry.release_date || "",
    pressing: entry.pressing || "",
    duration: entry.duration || "",
    genre: entry.genre || "",
    sub_genres: entry.sub_genres || "",
    theme: entry.theme || "",
    vinyl: entry.vinyl ? "Yes" : "No",
  };
}