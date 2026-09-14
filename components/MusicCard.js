import MetaRow from "./MetaRow.js";
import GenrePills from "./GenrePills.js";
import AlbumThemes from "./AlbumThemes.js";

// A single album card, styled like a curated physical record in an archive.
// Accepts one album object and renders everything about it.
export default function MusicCard({ album, hovered, onHover }) {
  const theme = AlbumThemes[album.theme] || AlbumThemes.cream;

  const card = {
    backgroundColor: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: hovered
      ? `0 14px 26px rgba(0,0,0,0.28), 0 1px 0 ${theme.accent}22`
      : `0 6px 12px rgba(0,0,0,0.18), 0 1px 0 ${theme.accent}22`,
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    transition: "transform 250ms ease, box-shadow 250ms ease",
    cursor: "pointer",
  };

  // The sleeve slides slightly out from behind the cover on hover.
  const vinyl = {
    position: "absolute",
    left: 6,
    bottom: 6,
    width: "100%",
    height: "96%",
    borderRadius: 12,
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    opacity: hovered ? 0.5 : 0.28,
    transform: hovered ? "translate(10px, 10px)" : "translate(4px, 6px)",
    transition: "transform 250ms ease, opacity 250ms ease",
    zIndex: 0,
  };

  const coverWrap = {
    position: "relative",
    paddingBottom: "12px",
  };

  const coverBox = {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: `0 4px 10px rgba(0,0,0,${hovered ? 0.24 : 0.14})`,
    transform: hovered ? "scale(1.035)" : "scale(1)",
    transition: "transform 250ms ease",
  };

  const titleStyle = {
    fontSize: 22,
    fontWeight: 500,
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: 0.5,
    color: theme.ink,
    margin: 0,
  };
  const artistStyle = {
    fontSize: 14,
    letterSpacing: 1,
    color: theme.sub,
    margin: "4px 0 0",
  };
  const divider = {
    borderTop: `1px solid ${theme.divider}`,
    margin: "14px 0",
  };

  return (
    <article
      style={card}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div style={{ padding: 16 }}>
        <div style={coverWrap}>
          {album.vinyl && <div aria-hidden="true" style={vinyl} />}
          <div style={coverBox}>
            <AlbumCover album={album} theme={theme} />
          </div>
        </div>

        <h3 style={titleStyle}>{album.title}</h3>
        <p style={artistStyle}>{album.artist}</p>

        <div style={divider} />

        <MetaRow
          icon="🕐"
          label="Release"
          value={`${album.releaseYear} · ${album.releaseDate}`}
          theme={theme}
        />
        <MetaRow
          icon="💿"
          label="Pressing"
          value={album.pressing}
          theme={theme}
        />
        <MetaRow
          icon="🎵"
          label="Genre"
          value={album.genre}
          theme={theme}
        />
        <MetaRow
          icon="⏱"
          label="Duration"
          value={album.duration}
          theme={theme}
        />

        <div style={divider} />
        <GenrePills
          genre={album.genre}
          subGenres={album.subGenres}
          theme={theme}
        />
      </div>
    </article>
  );
}

// The square album artwork, with a themed placeholder behind it that shows
// only if the cover image is missing or fails to load.
function AlbumCover({ album, theme }) {
  const fallback = {
    position: "absolute",
    inset: 0,
    display: "none",
    backgroundColor: theme.accent,
    color: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 44,
    fontFamily: "Georgia, serif",
  };
  const img = {
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
  };
  return (
    <div style={{ position: "relative", aspectRatio: "1 / 1" }}>
      <img
        src={album.coverImage}
        alt={`${album.title} cover`}
        style={img}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling.style.display = "flex";
        }}
      />
      <div style={fallback}>
        {album.title ? album.title[0].toUpperCase() : "?"}
      </div>
    </div>
  );
}