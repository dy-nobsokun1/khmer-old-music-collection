"use client";
import { useState } from "react";
import SearchBar from "./SearchBar.js";
import MusicGrid from "./MusicGrid.js";
import searchAlbums from "./searchAlbums.js";
import ArchiveNotice from "./ArchiveNotice.js";

// Owns the search state: renders the search bar, filters the album list, and
// shows the matching cards. The albums arrive from the page, which reads them
// out of Supabase; `loading` is true while that query is still running.
export default function MusicArchive({
  albums = [],
  loading = false,
  error = false,
  // Optional headings and empty-state copy. The public archive passes none of
  // these and gets the wording below; a contributor list passes its own, so the
  // grid and the search do not have to exist twice.
  kickerLabel = "THE COLLECTION",
  heading = "Curated Records",
  description =
    "A selection of records that shaped the sound \u2014 each one catalogued like a museum piece.",
  emptyMessage =
    "The archive is empty \u2014 no entries have been published yet.",
}) {
  const [query, setQuery] = useState("");
  const results = searchAlbums(albums, query);
  const searching = query.trim().length > 0;

  const section = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 24px 72px",
    position: "relative",
    zIndex: 2,
  };
  const kicker = {
    fontFamily: "'Courier New', monospace",
    color: "#A65A3C",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  };
  const title = {
    fontSize: 34,
    fontWeight: 500,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    letterSpacing: 1,
    color: "#4A3B2A",
    margin: "10px 0 6px",
  };
  const sub = {
    fontSize: 15,
    color: "#7A6B53",
    lineHeight: 1.6,
    margin: "0 0 4px",
  };
  const count = {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    color: "#A08C6F",
    margin: "12px 0 0",
    letterSpacing: 1,
  };

  return (
    <section style={section}>
      <p style={kicker}>{kickerLabel}</p>
      <h2 style={title}>{heading}</h2>
      {description ? <p style={sub}>{description}</p> : null}

      <SearchBar value={query} onChange={setQuery} />

      {loading ? null : (
        <p style={count}>
          {results.length} record{results.length === 1 ? "" : "s"} found
        </p>
      )}

      {/* Three ways to have no cards to draw, all in the same dashed box: the
          entries are still loading, the query failed, the archive is empty, or
          the search simply matched nothing. */}
      {loading ? (
        <ArchiveNotice>Loading the collection…</ArchiveNotice>
      ) : error ? (
        <ArchiveNotice>
          Couldn’t load the collection. Please refresh the page to try again.
        </ArchiveNotice>
      ) : results.length === 0 && searching ? (
        <ArchiveNotice>
          No records match “{query}”. Try another title, artist, or genre.
        </ArchiveNotice>
      ) : results.length === 0 ? (
        <ArchiveNotice>{emptyMessage}</ArchiveNotice>
      ) : (
        <MusicGrid albums={results} />
      )}
    </section>
  );
}