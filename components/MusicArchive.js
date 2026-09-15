"use client";
import { useState } from "react";
import SearchBar from "./SearchBar.js";
import MusicGrid from "./MusicGrid.js";
import searchAlbums from "./searchAlbums.js";

// Owns the search state: renders the search bar, filters the album list, and
// shows the matching cards (or a "no results" message).
export default function MusicArchive({ albums }) {
  const [query, setQuery] = useState("");
  const results = searchAlbums(albums, query);

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
  const empty = {
    padding: "40px 20px",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#7A6B53",
    border: "1px dashed #CFBFA1",
    borderRadius: 12,
  };

  return (
    <section style={section}>
      <p style={kicker}>THE COLLECTION</p>
      <h2 style={title}>Curated Records</h2>
      <p style={sub}>
        A selection of records that shaped the sound — each one catalogued like
        a museum piece.
      </p>

      <SearchBar value={query} onChange={setQuery} />

      <p style={count}>
        {results.length} record{results.length === 1 ? "" : "s"} found
      </p>

      {results.length === 0 ? (
        <div style={empty}>
          No records match “{query}”. Try another title, artist, or genre.
        </div>
      ) : (
        <MusicGrid albums={results} />
      )}
    </section>
  );
}