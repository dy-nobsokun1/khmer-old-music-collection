import { createClient } from "../utils/supabase/server.js";
import MusicArchive from "./MusicArchive.js";

// Reads the archive's entries out of Supabase and hands them to the archive
// view. Runs on the server, so the Supabase client and the session cookies
// stay where they belong and nothing but plain card data reaches the browser.
//
// Each published entry is also matched to its contributor's public profile
// (entries.owner -> profiles.id) so the cards can show who added the record.
// The owners alone are collected on the server and looked up in ONE profiles
// query, so we never fire a database request per card. The owner ids are then
// dropped — the browser receives only the public display name and avatar URL.
//
// Because this is async and the page wraps it in <Suspense>, Next streams the
// rest of the page first and shows the archive's loading notice while this
// query is in flight.
export default async function MusicArchiveFromSupabase() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    // Columns are listed one by one instead of "*" so only the fields the cards
    // need cross the network. owner is selected only so the profile match can
    // happen below; it never reaches the browser (toCard drops it).
    .select(
      "id, created_at, title, slug, artist, release_year, release_date, " +
        "pressing, duration, genre, sub_genres, vinyl_image, theme, vinyl, owner"
    )
    // Published entries only — the public archive and search never show
    // draft or returned rows.
    .eq("status", "published")
    // Newest first. The id is a tiebreaker: every entry currently shares one
    // created_at, so without it the grid could reshuffle between visits.
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  // A failed query shows the same notice box as an empty archive, so a
  // dropped connection is never mistaken for "there is nothing here yet".
  if (error) {
    return <MusicArchive albums={[]} error />;
  }

  const rows = data || [];

  // One batched profiles lookup for every distinct owner on this page, rather
  // than a query per card. Profiles are optional, so owners without a row
  // simply have no contributor object and fall back to "Anonymous contributor".
  const owners = [...new Set(rows.map((row) => row.owner).filter(Boolean))];
  const contributorByOwner = new Map();
  if (owners.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_path")
      .in("id", owners);
    for (const profile of profiles || []) {
      contributorByOwner.set(profile.id, buildContributor(profile, supabase));
    }
  }

  return (
    <MusicArchive
      albums={rows.map((row) =>
        toCard(row, contributorByOwner.get(row.owner) || null)
      )}
    />
  );
}

// One Supabase row -> the object shape MusicCard and searchAlbums expect.
// Exported because the contributor list (app/my-archive) maps its rows here
// too: a card must be built the same way wherever it is shown, or the two
// halves start disagreeing about what a record looks like.
// Column names are renamed, not rewritten: every value, Khmer text included,
// is passed through exactly as it is stored.
export function toCard(row, contributor = null) {
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
    // The card-level credit. Only public fields; never an email, never the
    // owner's id. Null means "no public profile", rendered as anonymous.
    contributor,
  };
}

// Turns one public.profiles row into the { displayName, avatarUrl } object a
// card displays. avatarUrl is derived from the stored avatar_path with the
// bucket's public read URL, so the browser never needs a storage-level check.
export function buildContributor(profile, supabase) {
  if (!profile) return null;
  const { data } = profile.avatar_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_path)
    : { data: null };
  return {
    displayName: profile.display_name || "",
    avatarUrl: data?.publicUrl || null,
  };
}

// "som-bour-meas" -> "som bour meas". Only the hyphens change: the stored
// slug's own capitalisation is left alone. An entry with no slug has no
// English name, and MusicCard simply leaves that line out.
function slugToEnglishTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}
