import AlbumThemes from "./AlbumThemes.js";

// The genres this archive actually holds, taken from the real records already in
// the collection (app/page.js). Keeping the list short and concrete means a
// contributor can only file a record into a genre that already exists in the
// archive, which keeps the genre column honest.
const genreOptions = [
  "Khmer Traditional",
  "Khmer Pop",
  "Khmer Rock",
  "Latin",
  "Rock and Roll",
  "Cambodian Vintage Rock",
  "Slow Rock",
];

// The theme list is read straight out of AlbumThemes rather than restated here.
// AlbumThemes is a plain object literal with no imports and no server-only
// dependencies, so it is safe to import from a Client Component (MusicCard
// already does exactly this inside the client-rendered grid). Deriving the list
// means a theme can never be offered in the form and then fail to render on a
// card: the two halves share one source of truth.
const themeOptions = Object.keys(AlbumThemes);

// The vinyl field is a Yes/No question, not a boolean, because that is how the
// archive already talks about it. The form shows these exact strings; the
// boolean conversion happens once at the insert boundary.
const vinylOptions = ["Yes", "No"];

// Mirrors the accept attribute on the file input so the OS picker starts on the
// right formats. It is a convenience filter only — the real checks are the
// allowlist in entryValidation.js, which a user can always bypass.
const acceptedImageTypes = "image/jpeg,image/png,image/webp";

export {
  genreOptions,
  themeOptions,
  vinylOptions,
  acceptedImageTypes,
};