import collection from "../collection.config.js";

// The warm cream that ties the whole page together.
const paper = "#F5F3C7";
// A slightly darker cream for borders and ruled lines.
const paperEdge = "#E7E0B8";
// Deep sepia ink for body text.
const ink = "#4A3B2A";
// Muted terracotta accent.
const rust = "#A65A3C";

const styles = {
  hero: {
    position: "relative",
    height: "70vh",
    minHeight: 340,
    // The photo lives here — drop your image at public/images/header.jpg
    // and this background will pick it up.
    backgroundImage:
      "url('/images/header.jpg'), linear-gradient(rgba(245,243,199,0.35), rgba(245,243,199,0.35))",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  // The fade: an overlay gradient that is transparent at the top and
  // becomes the paper cream at the bottom, so the last 30% of the photo
  // melts into the page below.
  heroFade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(245,243,199,0) 62%, rgba(245,243,199,0.9) 82%, #F5F3C7 100%)",
  },
  heroTitleWrap: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "0 24px 9vh",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 60px)",
    fontWeight: 400,
    letterSpacing: 2,
    margin: 0,
    color: ink,
    textShadow: "0 1px 0 #F5F3C7, 0 2px 3px rgba(74,59,42,0.35)",
  },
  wrap: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "72px 24px 64px",
    position: "relative",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: rust,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: 400,
    margin: "8px 0 16px",
    lineHeight: 1.15,
    letterSpacing: 1,
  },
  description: {
    fontSize: 19,
    color: ink,
    lineHeight: 1.65,
    margin: 0,
  },
  ruled: {
    height: 0,
    borderTop: `1px solid ${paperEdge}`,
    margin: "36px 0",
  },
  card: {
    marginBottom: 20,
    padding: "18px 20px",
    backgroundColor: "rgba(255,255,255,0.35)",
    border: `1px solid ${paperEdge}`,
    borderRadius: 6,
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: rust,
    margin: 0,
  },
  cardValue: {
    fontSize: 17,
    margin: "6px 0 0",
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: rust,
    marginTop: 44,
  },
  footer: {
    marginTop: 56,
    paddingTop: 20,
    borderTop: `1px solid ${paperEdge}`,
    fontSize: 13,
    color: "#7A6B53",
    lineHeight: 1.6,
  },
};

export default function Home() {
  return (
    <div style={{ position: "relative" }}>
      {/* Paper grain + soft vignette, layered over the whole page for a
          worn, printed feel. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.5,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <header style={styles.hero}>
        <div style={styles.heroFade} />
        <div style={styles.heroTitleWrap}>
          <h1 style={styles.heroTitle}>{collection.name}</h1>
        </div>
      </header>

      <main style={styles.wrap}>
        <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
        <p style={styles.description}>{collection.description}</p>

        <div style={styles.ruled} />

        <div style={styles.card}>
          <p style={styles.cardLabel}>CURATED BY</p>
          <p style={styles.cardValue}>{collection.curator}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>SOURCE</p>
          <p style={styles.cardValue}>{collection.source}</p>
        </div>

        <p style={styles.count}>entries in the archive: 0 (for now)</p>

        <footer style={styles.footer}>
          Built in ICT 340 — Vibe Coding, American University of Phnom Penh,
          Fall 2026. This archive is under construction all semester. Come
          back in December.
        </footer>
      </main>
    </div>
  );
}
