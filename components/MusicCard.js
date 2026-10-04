import Link from "next/link";
import MetaRow from "./MetaRow.js";
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
    // Fill the whole grid cell and stack content top-to-bottom so all cards
    // in a row share the same height.
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  // The vinyl record is the card's featured visual (the album-cover sleeve
  // box has been removed). Shown in its natural shape, with no circle mask
  // and no drop shadow.
  const vinyl = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: hovered ? "scale(1.035)" : "scale(1)",
    transition: "transform 250ms ease",
  };

  // A fixed-size image area keeps every card the same height even when the
  // vinyl photos have different pixel dimensions.
  const vinylWrap = {
    position: "relative",
    aspectRatio: "4 / 3",
    paddingBottom: "14px",
  };

  // Small corner tag marking a vinyl pressing. It borrows the pill colours from
  // the card's theme so it always sits on the palette rather than fighting it.
  const vinylBadge = {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 3,
    padding: "3px 10px",
    borderRadius: 999,
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.pillInk,
    backgroundColor: theme.pillBg,
    border: `1px solid ${theme.accent}55`,
  };

  // Content wrapper sits above the texture layer so text and artwork stay
  // clean, and stretches to fill the card height so every card matches.
  const content = {
    position: "relative",
    zIndex: 1,
    padding: 16,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const titleStyle = {
    fontSize: 22,
    fontWeight: 500,
    fontFamily: "'Kantumruy Pro', Georgia, 'Times New Roman', serif",
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
  const englishTitleStyle = {
    fontSize: 14,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: theme.sub,
    margin: "2px 0 0",
  };
  const divider = {
    borderTop: `1px solid ${theme.divider}`,
    margin: "14px 0",
  };

  // The record image comes straight from the entry, and it is used exactly as
  // stored: older entries hold a repo path like /images/vinyl 1.png, newer ones
  // hold a full Supabase Storage URL. Nothing is concatenated onto it and no
  // optimiser sits in front of it, so both shapes resolve without any config.
  const vinylSrc = album.vinylImage;

  // Rising notes: different sizes, staggered times, all drifting from under
  // the top-right of the vinyl up toward the card's top-right corner. The
  // keyframe handles the rise.
  const notes = [
    { symbol: "♪", size: 14, right: 12, top: 8, duration: "3.4s", delay: "0s" },
    { symbol: "♫", size: 24, right: 28, top: 22, duration: "2.6s", delay: "0.45s" },
    { symbol: "♪", size: 18, right: 48, top: 38, duration: "3.0s", delay: "0.9s" },
    { symbol: "♬", size: 29, right: 70, top: 54, duration: "2.2s", delay: "1.25s" },
    { symbol: "♪", size: 11, right: 92, top: 70, duration: "3.6s", delay: "1.6s" },
    { symbol: "♫", size: 21, right: 116, top: 88, duration: "2.9s", delay: "1.95s" },
    { symbol: "♪", size: 15, right: 140, top: 104, duration: "3.2s", delay: "2.3s" },
  ];

  // encodeURIComponent matters here: the archive already holds slugs with spaces
  // and capitals ("Som Bong Lerng Rom"), which would not match the /entries/[slug]
  // route unescaped. Next decodes params.slug back on arrival.
  const entryHref = album.slug
    ? `/entries/${encodeURIComponent(album.slug)}`
    : null;

  return entryHref ? (
    <Link href={entryHref} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
    <article
      style={card}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Card texture: paper/grunge grain multiplied across the card. It sits
          above the flat background but below the text and artwork, so it
          textures the background without muddying the readable content. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.5,
          mixBlendMode: "darken",
          backgroundImage: "url('/images/card-texture.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Grey paper texture: an additive (color-dodge / linear-dodge) wash
          at 30% over the card, still under the text and vinyl image. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.3,
          mixBlendMode: "color-dodge",
          backgroundImage: "url('/images/grey-paper-texture.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* A stream of music notes rising from under the top-right of the vinyl up
          toward the corner. Notes are varied in size and staggered in time so
          the loop feels like gentle, scattered music drifting upward. */}
      {notes.map((note) => (
        <span
          key={`${note.symbol}-${note.right}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            right: note.right,
            top: note.top,
            zIndex: 3,
            pointerEvents: "none",
            fontSize: note.size,
            lineHeight: 1,
            color: theme.accent,
            opacity: 0,
            animation: `noteRise ${note.duration} ease-in-out ${note.delay} infinite`,
          }}
        >
          {note.symbol}
        </span>
      ))}
      <div style={content}>
        {/* The photo shows whenever the entry has one. vinyl_image is a required
            column, so gating the image on the vinyl flag meant a contributor who
            answered "No" to "is this a vinyl pressing?" had their required photo
            stored with a working URL and then never displayed — the card looked
            empty. The two facts are now independent: the photo always renders,
            and the vinyl answer reads as the badge below. */}
        {vinylSrc && (
          <div style={vinylWrap}>
            <img
              src={vinylSrc}
              alt={`${album.title} record`}
              style={vinyl}
            />
            {album.vinyl ? (
              <span style={vinylBadge}>Vinyl</span>
            ) : null}
          </div>
        )}

        <h3 style={titleStyle}>{album.title}</h3>
        {album.englishTitle && (
          <p style={englishTitleStyle}>{album.englishTitle}</p>
        )}
        <p style={artistStyle}>{album.artist}</p>

        <div style={divider} />

        <MetaRow icon="🕐" label="Release" value={album.releaseYear} theme={theme} />
        <MetaRow icon="💿" label="Pressing" value={album.pressing} theme={theme} />
        <MetaRow icon="🎵" label="Genre" value={album.genre} theme={theme} />
        <MetaRow icon="⏱" label="Duration" value={album.duration} theme={theme} />
      </div>
    </article>
    </Link>
  ) : (
    // Only reachable if an entry somehow has no slug. Rendered without the
    // link so a missing value cannot produce a dead /entries/ href.
    <article style={card}>
      <div style={content}>
        <h3 style={titleStyle}>{album.title}</h3>
        <p style={artistStyle}>{album.artist}</p>
      </div>
    </article>
  );
}