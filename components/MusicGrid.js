"use client";
import { useState } from "react";
import MusicCard from "./MusicCard.js";

// Responsive archive grid using flex-wrap, so cards naturally go 3-per-row
// on wide screens, then wrap to 2, then 1 as the viewport narrows — no media
// queries needed. Tracks which card is hovered to drive the lift animation.
export default function MusicGrid({ albums }) {
  // Each card grows to share the row equally, but refuses to shrink below a
  // readable width; when three won't fit, the extras wrap to the next line.
  const grid = {
    display: "flex",
    flexWrap: "wrap",
    gap: 32,
    justifyContent: "flex-start",
  };

  return (
    <div style={grid}>
      {albums.map((album) => (
        <GridItem key={album.title} album={album} />
      ))}
    </div>
  );
}

function GridItem({ album }) {
  const [hovered, setHovered] = useState(false);
  const width = {
    // Basis ~ one third of the row; grows to fill, shrinks gracefully.
    flex: "1 1 310px",
    minWidth: 260,
    maxWidth: "100%",
  };
  return (
    <div style={width}>
      <MusicCard album={album} hovered={hovered} onHover={setHovered} />
    </div>
  );
}