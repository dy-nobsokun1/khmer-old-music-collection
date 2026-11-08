import { notFound } from "next/navigation";
import { createClient } from "../../../utils/supabase/server.js";
import EntryDetail from "../../../components/EntryDetail.js";
import { buildContributor } from "../../../components/MusicArchiveFromSupabase.js";

// One entry's page, addressed by its slug.
//
// The ownership decision is made here, on the server, and only the resulting
// yes/no crosses into the browser. The owner's user id is used for the
// comparison and then dropped: it is never passed to a Client Component, which
// keeps the same privacy stance the grid already takes when it selects its
// columns one by one and leaves `owner` out (components/MusicArchiveFromSupabase.js).
export default async function EntryPage({ params }) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: entry } = await supabase
    .from("entries")
    .select(
      "id, title, slug, artist, release_year, release_date, pressing, " +
        "duration, genre, sub_genres, vinyl_image, theme, vinyl, owner"
    )
    .eq("slug", slug)
    .maybeSingle();

  // An unknown slug is a 404, not an empty page.
  if (!entry) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = Boolean(user) && entry.owner === user.id;

  // owner is dropped here on purpose: everything below this line is a Client
  // Component, and it has no use for the value.
  const { owner, ...safeEntry } = entry;

  // Contributor credit: match the entry's owner to their public profile so the
  // detail page shows who added it. Only the public name and avatar URL go to
  // the browser; owner and any profile internals stay on the server.
  let contributor = null;
  if (owner) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_path")
      .eq("id", owner)
      .maybeSingle();
    contributor = buildContributor(profile, supabase);
  }

  return (
    <EntryDetail
      entry={safeEntry}
      isOwner={isOwner}
      userId={isOwner ? user.id : null}
      contributor={contributor}
    />
  );
}