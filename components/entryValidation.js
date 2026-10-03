import {
  genreOptions,
  themeOptions,
  vinylOptions,
} from "./entryOptions.js";

// Every rule the form enforces before it is allowed to talk to Supabase.
// Pure functions: they take strings and return messages, so they can be read
// and argued about without a browser. Return shape is { fieldName: message },
// which is exactly what the form needs to place a message under one field.

// The one place an uploaded file is judged. OWASP's guidance is to allowlist
// rather than blocklist, so both the claimed MIME type and the filename
// extension must independently land in this list. Checking one without the other
// is the hole: MIME alone is attacker-chosen, and an extension alone is renamed
// in a second. Anything not in here never reaches storage.
const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Slug: lowercase English letters, numbers and hyphens. Anchored on both ends so
// a trailing space or newline cannot slip past, and no /\p{L}/u flag, so an
// uppercase or Khmer character is rejected exactly as typed. Uniqueness is
// deliberately NOT checked here — see the note above validateEntry.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Release year, when given, must look like a year.
const YEAR_PATTERN = /^\d{4}$/;

// Duration must be MM:SS with seconds under 60.
const DURATION_PATTERN = /^(?:[0-9]|[1-9][0-9]):[0-5][0-9]$/;

// release_date is the archive's freest field: records survive with a bare year,
// an approximate year, or nothing at all. These patterns cover what the
// collection already contains.
const YEAR_ONLY = /^(\d{4})$/;
const APPROXIMATE = /^(?:circa|c\.|approx\.?|about|~)?\s*(\d{4})$/i;
const FULL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// "Unknown" and "Pre-1975" are the two non-date values the archive already uses
// for records nobody can date. They are accepted verbatim rather than rejected,
// because a contributor should not have to invent a date to file a record.
const UNDATED = /^(unknown|pre-?1975)$/i;

// Trims every text field in one place, so no caller can forget one. Khmer text is
// trimmed like any other string; nothing is normalised or transliterated.
export function trimValues(values) {
  const out = {};
  for (const [key, value] of Object.entries(values)) {
    out[key] = typeof value === "string" ? value.trim() : value;
  }
  return out;
}

// The single source of truth for "is this file acceptable", shared by the form
// (for its inline message) and by the uploader (which must not trust that the
// form already checked). Returns "" when the file is fine, otherwise the message
// to show. This inspects file.type and the extension only — both values the
// browser reports — so it is a cheap first gate, not proof of content. The
// safety that actually matters is that the object is stored under a name we
// generate and served from the bucket's public read path.
export function validateImageFile(file) {
  if (!file) return "Choose a photo of the record.";
  const type = file.type || "";
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_TYPES, type)) {
    return "The photo must be a JPG, PNG or WebP image.";
  }
  const extension = (file.name || "").split(".").pop().toLowerCase();
  if (extension !== ALLOWED_IMAGE_TYPES[type]) {
    return `The photo must be a ${ALLOWED_IMAGE_TYPES[type].toUpperCase()} file.`;
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return "The photo must be 5 MB or smaller.";
  }
  return "";
}

// Turns the English title a contributor types into the stored slug.
//
// "Mok Rom Chea Muoy Chan Chhaya" -> "mok-rom-chea-muoy-chan-chhaya"
//
// Everything that is not a lowercase letter or digit becomes a single hyphen,
// which absorbs spaces, accents, apostrophes and punctuation in one pass and
// cannot leave a double hyphen. Then the ends are trimmed of hyphens, so a
// title that starts or ends in punctuation does not produce a dangling
// separator. Spaces, capitals and underscores all land on the same slug, so
// "som bour meas" and "Som Bour Meas" both become "som-bour-meas".
//
// Deliberately lossy, and only for the slug: the contributor's own spelling
// goes into the title field untouched, Khmer included. Nothing here reads,
// alters or transliterates Khmer text.
export function toSlug(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// SLUG UNIQUENESS is intentionally not checked here. Pre-checking would mean
// selecting every slug in the table and shipping the whole list to the browser,
// so any signed-in user could read every slug in the archive. Instead the form
// checks only that a slug is well-formed and lets the database's unique
// constraint be the single authority; the form maps PostgreSQL's 23505 back to
// the slug field.
//
// One rule per field, and only the first failure in a field is reported, so the
// contributor sees one clear thing to fix rather than a cascade. Returns an
// object that is empty when the entry is good to submit.
export function validateEntry(values, file) {
  const v = trimValues(values);
  const errors = {};

  if (!v.title) errors.title = "Give the record a title.";
  else if (v.title.length > 200) errors.title = "Keep the title to 200 characters or fewer.";

  if (!v.slug) errors.slug = "Type the English title so a slug can be made from it.";
  else if (v.slug.length > 100) errors.slug = "Keep the slug to 100 characters or fewer.";
  else if (!SLUG_PATTERN.test(v.slug)) {
    errors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  if (!v.artist) errors.artist = "Name the artist.";
  else if (v.artist.length > 150) errors.artist = "Keep the artist to 150 characters or fewer.";

  // Optional: an absent value is fine, a present one must be a real year.
  const currentYear = new Date().getFullYear();
  if (v.release_year && !YEAR_PATTERN.test(v.release_year)) {
    errors.release_year = "Use a 4-digit year, for example 1975.";
  } else if (v.release_year) {
    const year = Number(v.release_year);
    if (year < 1900 || year > currentYear) {
      errors.release_year = `Use a year between 1900 and ${currentYear}.`;
    }
  }

  if (v.release_date && !isAcceptableDate(v.release_date)) {
    errors.release_date =
      "Use a year, a date, or an approximate year — 1975, circa 1975, or 1975-06-14.";
  }

  if (v.pressing && v.pressing.length > 200) {
    errors.pressing = "Keep the pressing to 200 characters or fewer.";
  }

  if (!v.duration) errors.duration = "Enter the running time as MM:SS.";
  else if (!DURATION_PATTERN.test(v.duration)) {
    errors.duration = "Use MM:SS format, for example 03:42.";
  }

  if (!v.genre) errors.genre = "Choose a genre.";
  else if (!genreOptions.includes(v.genre)) errors.genre = "Choose a genre from the list.";

  if (v.sub_genres && v.sub_genres.length > 200) {
    errors.sub_genres = "Keep the sub-genres to 200 characters or fewer.";
  }

  const imageError = validateImageFile(file);
  if (imageError) errors.vinyl_image = imageError;

  if (!v.theme) errors.theme = "Choose a card theme.";
  else if (!themeOptions.includes(v.theme)) errors.theme = "Choose a theme from the list.";

  if (!v.vinyl) errors.vinyl = "Choose Yes or No.";
  else if (!vinylOptions.includes(v.vinyl)) errors.vinyl = "Choose Yes or No.";

  return errors;
}

// A date is acceptable if it is one of the archive's "we do not know" words, a
// bare year, an optionally approximate year, or a real calendar date. A full
// date is parsed into a Date and read back field by field, so 1975-02-30 is
// rejected instead of silently becoming 1975-03-02.
function isAcceptableDate(raw) {
  if (UNDATED.test(raw)) return true;

  const full = FULL_DATE.exec(raw);
  if (full) {
    const [, y, m, d] = full.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  }

  const approximate = APPROXIMATE.exec(raw);
  if (approximate) {
    const year = Number(approximate[1]);
    return year >= 1000 && year <= new Date().getFullYear();
  }

  return YEAR_ONLY.test(raw);
}

export { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES };