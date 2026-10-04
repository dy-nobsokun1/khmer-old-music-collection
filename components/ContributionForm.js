"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EntryFields from "./EntryFields.js";
import uploadVinylImage from "./uploadVinylImage.js";
import { validateEntry, trimValues, toSlug } from "./entryValidation.js";
import { createClient } from "../utils/supabase/client.js";

// The add-an-entry form. A Client Component because it owns live field state,
// the photo file, and the upload.
//
// The fields, their hints and the submit button all live in EntryFields.js,
// which the edit form on an entry page renders too, so the two forms cannot
// drift apart. What is left here is what actually differs: inserting a new row
// rather than updating one, and a photo that is mandatory.
//
// The parent (app/contribute/page.js) is the gate: it has already confirmed the
// visitor is signed in and passes their user id down as a prop. There is no
// "owner" input here at all -- the owner is the session, full stop, so a crafted
// request cannot attribute an entry to somebody else from the browser.
export default function ContributionForm({ userId }) {
  const router = useRouter();
  const [values, setValues] = useState(blankValues());
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (name, value) =>
    setValues((v) => ({ ...v, [name]: value }));

  // Selecting a new photo clears the old error, otherwise a corrected choice
  // would still say "choose a photo" until the next submit.
  const onFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setErrors((e) => ({ ...e, vinyl_image: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setFormError("");

    // Validate the trimmed values, so a title of only spaces fails here rather
    // than being written to the database as an empty string.
    const trimmed = trimValues(values);
    // The slug is derived from whatever was typed, so the contributor can enter
    // the English title in any casing, with or without spaces, and still store
    // a slug that matches the rest of the archive. Validation then runs on the
    // derived value rather than the raw input.
    const slug = toSlug(trimmed.slug);
    const found = validateEntry({ ...trimmed, slug }, file);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();

      // Upload first: vinyl_image is required, so there is no point inserting a
      // row whose one required column is still unknown.
      const vinylImage = await uploadVinylImage(file, userId);

      // Columns are named one by one. No ...spread, so nothing the browser sends
      // can reach a column that is not listed here, and id and created_at stay
      // out of it because the database generates them.
      const { error: insertError } = await supabase.from("entries").insert({
        title: trimmed.title,
        slug,
        artist: trimmed.artist,
        // Optional columns become null, not "", so the read-side fallbacks
        // (release_year ?? "Unknown") keep working.
        release_year: trimmed.release_year ? Number(trimmed.release_year) : null,
        release_date: trimmed.release_date || null,
        pressing: trimmed.pressing || null,
        duration: trimmed.duration,
        genre: trimmed.genre,
        sub_genres: trimmed.sub_genres || null,
        vinyl_image: vinylImage,
        theme: trimmed.theme,
        // The form asked a Yes/No question; the column is a boolean.
        vinyl: trimmed.vinyl === "Yes",
        owner: userId,
      });

      if (insertError) {
        console.error(
          "[contribute] entry insert failed:",
          insertError.code,
          insertError.message
        );
        // 23505 is Postgres's unique-violation code, which here means the slug
        // is taken. The text check as well as the code: if another column ever
        // gains a unique constraint, a bare code check would show a confident
        // but wrong "that slug is taken" message.
        if (insertError.code === "23505" && /slug/i.test(insertError.message || "")) {
          setErrors((e) => ({
            ...e,
            slug: "That slug is already taken. Please choose another.",
          }));
          setFormError("That slug is already in use - pick a different one.");
        } else {
          setFormError("That entry could not be saved. Please try again in a moment.");
        }
        setBusy(false);
        return;
      }

      // Saved. Back to the archive, where the newest entry sorts to the top of
      // the grid. refresh() re-runs the server components so the new row is
      // really there instead of the previously rendered list.
      router.push("/");
      router.refresh();
    } catch (caught) {
      // The uploader throws short, safe messages; anything else is unexpected
      // (a dropped connection, a missing env var). Log the real cause, show the
      // same guarded message either way.
      console.error("[contribute] submission failed:", caught);
      setFormError("That entry could not be saved. Please try again in a moment.");
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
      submitLabel="Add to the archive"
      busyLabel="Uploading photo…"
      photoRequired
    />
  );
}

// Every field starts empty, including the optional ones.
function blankValues() {
  return {
    title: "",
    slug: "",
    artist: "",
    release_year: "",
    release_date: "",
    pressing: "",
    duration: "",
    genre: "",
    sub_genres: "",
    theme: "",
    vinyl: "",
  };
}