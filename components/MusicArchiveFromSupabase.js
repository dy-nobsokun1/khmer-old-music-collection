import { createClient } from "../utils/supabase/server.js";
import MusicArchive from "./MusicArchive.js";

// Reads the archive's entries out of Supabase and hands them to the archive
// view. Runs on the server, so the Supabase client and the session cookies
// stay where they belong and nothing but plain card data reaches the browser.
//
// Because this is async and the page wraps it in <Suspense>, Next streams the
// rest of the page first and shows the archive's loading notice while this
// query is in flight.
export default async function MusicArchiveFromSupabase() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    // Columns are listed one by one instead of "*" so the owner's user id is
    // never sent to the browser. Everything the cards and the search need.
    .select(
      "id, created_at, title, slug, artist, release_year, release_date, " +
        "pressing, duration, genre, sub_genres, vinyl_image, theme, vinyl"
    )
    // Newest first. The id is a tiebreaker: every entry currently shares one
    // created_at, so without it the grid could reshuffle between visits.
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  // A failed query shows the same notice box as an empty archive, so a
  // dropped connection is never mistaken for "there is nothing here yet".
  if (error) {
    return <MusicArchive albums={[]} error />;
  }

  return <MusicArchive albums={(data || []).map(toCard)} />;
}

// One Supabase row -> the object shape MusicCard and searchAlbums expect.
// Column names are renamed, not rewritten: every value, Khmer text included,
// is passed through exactly as it is stored.
function toCard(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    // The table has no english_title column: an entry's English name is just
    // its slug with the hyphens read as spaces again.
    englishTitle: slugToEnglishTitle(row.slug),
    artist: row.artist,
    // release_year is a number column, so older records with no year saved
    // arrive as null. "Unknown" is the word the rest of the rows already use.
    releaseYear: row.release_year ?? "Unknown",
    releaseDate: row.release_date,
    pressing: row.pressing,
    duration: row.duration,
    genre: row.genre,
    // sub_genres is stored as one comma-separated string; the search expects a
    // list, so split it back apart.
    subGenres: (row.sub_genres || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    vinylImage: row.vinyl_image,
    theme: row.theme,
    vinyl: row.vinyl,
  };
}

// "som-bour-meas" -> "som bour meas". Only the hyphens change: the stored
// slug's own capitalisation is left alone. An entry with no slug has no
// English name, and MusicCard simply leaves that line out.
function slugToEnglishTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}
