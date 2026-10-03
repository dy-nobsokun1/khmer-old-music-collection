"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EntryField from "./EntryField.js";
import uploadVinylImage from "./uploadVinylImage.js";
import { validateEntry, trimValues, toSlug } from "./entryValidation.js";
import {
  genreOptions,
  themeOptions,
  vinylOptions,
  acceptedImageTypes,
} from "./entryOptions.js";
import { createClient } from "../utils/supabase/client.js";
import { styles } from "./contributeStyles.js";

// The add-an-entry form. A Client Component because it owns live field state,
// the photo file, and the upload.
//
// The parent (app/contribute/page.js) is the gate: it has already confirmed the
// visitor is signed in and passes their user id down as a prop. There is no
// "owner" input here at all — the owner is the session, full stop, so a crafted
// request cannot attribute an entry to somebody else from the browser.
export default function ContributionForm({ userId }) {
  const router = useRouter();
  const [values, setValues] = useState(blankValues());
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  // One handler factory for every text field, so adding a field is a one-line
  // change and no field can be wired to the wrong state key.
  const bind = (name) => ({
    value: values[name] || "",
    onChange: (event) => setValues((v) => ({ ...v, [name]: event.target.value })),
  });

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
          setFormError("That slug is already in use — pick a different one.");
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
    // noValidate: the browser's own bubbles would pre-empt our messages, and
    // would not know about rules like the 5 MB photo cap.
    <form onSubmit={submit} style={styles.form} noValidate>
      <EntryField
        id="title"
        label="Title"
        hint="Khmer or English, up to 200 characters."
        error={errors.title}
        required
        maxLength={200}
        {...bind("title")}
      />

      <EntryField
        id="slug"
        label="Slug"
        hint="Type the English title. Spaces and capitals are converted for you."
        error={errors.slug}
        required
        maxLength={100}
        {...bind("slug")}
      />

      <EntryField
        id="artist"
        label="Artist"
        hint="Up to 150 characters."
        error={errors.artist}
        required
        maxLength={150}
        {...bind("artist")}
      />

      <EntryField
        id="release_year"
        label="Release year"
        hint="Optional. A year between 1900 and today."
        error={errors.release_year}
        inputMode="numeric"
        {...bind("release_year")}
      />

      <EntryField
        id="release_date"
        label="Release date"
        hint="Optional. 1975, circa 1975, 1975-06-14, or Unknown."
        error={errors.release_date}
        {...bind("release_date")}
      />

      <EntryField
        id="pressing"
        label="Pressing"
        hint="Optional, up to 200 characters. e.g. Olympic · 45-8013-B"
        error={errors.pressing}
        maxLength={200}
        {...bind("pressing")}
      />

      <EntryField
        id="duration"
        label="Duration"
        hint="Running time as MM:SS, e.g. 03:42."
        error={errors.duration}
        required
        placeholder="03:42"
        {...bind("duration")}
      />

      <EntryField
        id="genre"
        label="Genre"
        error={errors.genre}
        required
        options={genreOptions}
        {...bind("genre")}
      />

      <EntryField
        id="sub_genres"
        label="Sub-genres"
        hint="Optional, up to 200 characters. Separate several with commas."
        error={errors.sub_genres}
        maxLength={200}
        {...bind("sub_genres")}
      />

      {/* The photo is a File, not text, so it gets its own onChange: the state
          holds the File object for the uploader, never a path or a data URL. */}
      <EntryField
        id="vinyl_image"
        label="Photo of the record"
        hint="Required. JPG, PNG or WebP, up to 5 MB."
        error={errors.vinyl_image}
        required
        type="file"
        accept={acceptedImageTypes}
        onChange={onFileChange}
      />

      <EntryField
        id="theme"
        label="Card theme"
        error={errors.theme}
        required
        options={themeOptions}
        {...bind("theme")}
      />

      {/* A Yes/No question in the UI; the insert turns it into a boolean. */}
      <EntryField
        id="vinyl"
        label="Is this a vinyl pressing?"
        error={errors.vinyl}
        required
        options={vinylOptions}
        {...bind("vinyl")}
      />

      {formError ? (
        <p style={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      {/* Disabled for the whole upload-and-save round trip, so a second click
          cannot start a duplicate upload or a second insert. */}
      <button
        type="submit"
        disabled={busy}
        style={busy ? { ...styles.button, ...styles.buttonBusy } : styles.button}
      >
        {busy ? "Uploading photo…" : "Add to the archive"}
      </button>
    </form>
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