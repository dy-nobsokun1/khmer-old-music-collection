"use client";
import EntryField from "./EntryField.js";
import {
  genreOptions,
  themeOptions,
  vinylOptions,
  acceptedImageTypes,
} from "./entryOptions.js";
import { styles } from "./contributeStyles.js";

// The field list, shared by /contribute and by the inline edit form on an entry
// page. Both render this same array, so a label or a hint cannot drift between
// the two, and adding a field is one entry here rather than two blocks of JSX.
//
// name    the key in the form's values object
// options present means a <select> rather than a text input
// type    "file" marks the photo field, whose required state differs per mode
const FIELDS = [
  { name: "title", label: "Title", hint: "Khmer or English, up to 200 characters.", required: true, maxLength: 200 },
  { name: "slug", label: "Slug", hint: "Type the English title. Spaces and capitals are converted for you.", required: true, maxLength: 100 },
  { name: "artist", label: "Artist", hint: "Up to 150 characters.", required: true, maxLength: 150 },
  { name: "release_year", label: "Release year", hint: "Optional. A year between 1900 and today.", inputMode: "numeric" },
  { name: "release_date", label: "Release date", hint: "Optional. 1975, circa 1975, 1975-06-14, or Unknown." },
  { name: "pressing", label: "Pressing", hint: "Optional, up to 200 characters. e.g. Olympic \u00b7 45-8013-B", maxLength: 200 },
  { name: "duration", label: "Duration", hint: "Running time as MM:SS, e.g. 03:42.", required: true, placeholder: "03:42" },
  { name: "genre", label: "Genre", required: true, options: genreOptions },
  { name: "sub_genres", label: "Sub-genres", hint: "Optional, up to 200 characters. Separate several with commas.", maxLength: 200 },
  { name: "vinyl_image", label: "Photo of the record", hint: "Required. JPG, PNG or WebP, up to 5 MB.", type: "file", accept: acceptedImageTypes },
  { name: "theme", label: "Card theme", required: true, options: themeOptions },
  { name: "vinyl", label: "Is this a vinyl pressing?", required: true, options: vinylOptions },
];

// Renders the whole field list plus the submit button. Owns no state: the parent
// supplies the values, the errors and the handlers.
//
// photoRequired is the one real difference between add and edit. A new entry
// must have a photo; an edit may leave the picker empty, which is how the
// existing photo is kept.
export default function EntryFields({
  values,
  errors,
  formError,
  busy,
  onChange,
  onFileChange,
  onSubmit,
  submitLabel,
  busyLabel,
  photoRequired = true,
}) {
  return (
    // noValidate: the browser's own bubbles would pre-empt our messages, and
    // would not know about rules like the 5 MB photo cap.
    <form onSubmit={onSubmit} style={styles.form} noValidate>
      {FIELDS.map((field) => {
        const isPhoto = field.type === "file";
        const required = isPhoto ? photoRequired : field.required;

        return (
          <EntryField
            key={field.name}
            id={field.name}
            label={field.label}
            hint={
              isPhoto && !photoRequired
                ? "Optional. Leave this empty to keep the current photo. JPG, PNG or WebP, up to 5 MB."
                : field.hint
            }
            error={errors[field.name]}
            required={required}
            options={field.options}
            type={field.type}
            accept={field.accept}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            inputMode={field.inputMode}
            {...(isPhoto
              ? { onChange: onFileChange }
              : {
                  value: values[field.name] || "",
                  onChange: (event) => onChange(field.name, event.target.value),
                })}
          />
        );
      })}

      {formError ? (
        <p style={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      {/* Disabled for the whole upload-and-save round trip, so a second click
          cannot start a duplicate upload or a second write. */}
      <button
        type="submit"
        disabled={busy}
        style={busy ? { ...styles.button, ...styles.buttonBusy } : styles.button}
      >
        {busy ? busyLabel : submitLabel}
      </button>
    </form>
  );
}