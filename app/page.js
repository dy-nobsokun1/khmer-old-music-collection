import collection from "../collection.config.js";
import MusicGrid from "../components/MusicGrid.js";

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
    // Anchor the photo to the top so, when the banner gets taller than the
    // image, any cropping happens off the bottom — never the top.
    backgroundPosition: "center top",
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
  // The "why this archive" intro: paragraph on the left, single on the right.
  intro: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "64px 24px",
    display: "flex",
    gap: 48,
    alignItems: "flex-start",
    // Stack on narrow screens so reading stays comfortable.
    flexWrap: "wrap",
  },
  introText: {
    flex: "1 1 420px",
    minWidth: 0,
  },
  introKicker: {
    fontFamily: "'Courier New', monospace",
    color: rust,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  },
  introTitle: {
    fontSize: 30,
    fontWeight: 400,
    letterSpacing: 1,
    margin: "10px 0 16px",
    lineHeight: 1.2,
  },
  introPara: {
    fontSize: 18,
    color: ink,
    lineHeight: 1.7,
    margin: 0,
  },
  introSingle: {
    flex: "1 1 320px",
    minWidth: 0,
    textAlign: "center",
  },
  singleFrame: {
    width: "100%",
    maxWidth: 360,
    // Deep espresso-brown matte frame around the single.
    border: "10px solid #3A2317",
    boxShadow:
      "0 1px 0 #3A2317, 0 8px 20px rgba(74,59,42,0.18)",
    transform: "rotate(-0.6deg)",
  },
  singleImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  singleCaption: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    letterSpacing: 1,
    color: "#7A6B53",
    margin: "12px 0 48px",
    textAlign: "center",
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
  musicSection: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 24px 72px",
  },
  musicKicker: {
    fontFamily: "'Courier New', monospace",
    color: rust,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  },
  musicTitle: {
    fontSize: 34,
    fontWeight: 500,
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: 1,
    color: ink,
    margin: "10px 0 6px",
  },
  musicSub: {
    fontSize: 15,
    color: "#7A6B53",
    lineHeight: 1.6,
    margin: 0,
  },
};

// The archive's album collection. Each entry is one curated record.
// Drop cover art at /images/covers/<slug>.jpg and set coverImage below.
const albums = [
  {
    slug: "kind-of-blue",
    title: "Kind of Blue",
    artist: "Miles Davis",
    releaseYear: "1959",
    releaseDate: "Aug 17, 1959",
    pressing: "2017 · 180g Vinyl",
    duration: "45:48",
    genre: "Jazz",
    subGenres: ["Modal", "Cool Jazz", "Post-Bop"],
    coverImage: "/images/covers/kind-of-blue.jpg",
    theme: "charcoal",
    vinyl: true,
  },
  {
    slug: "abbey-road",
    title: "Abbey Road",
    artist: "The Beatles",
    releaseYear: "1969",
    releaseDate: "Sep 26, 1969",
    pressing: "2019 · 180g Vinyl",
    duration: "47:03",
    genre: "Rock",
    subGenres: ["Classic Rock", "Pop Rock", "Psychedelic Rock"],
    coverImage: "/images/covers/abbey-road.jpg",
    theme: "cream",
    vinyl: true,
  },
  {
    slug: "come-away-with-me",
    title: "Come Away With Me",
    artist: "Norah Jones",
    releaseYear: "2002",
    releaseDate: "Feb 26, 2002",
    pressing: "2013 · 180g Vinyl",
    duration: "45:07",
    genre: "Jazz",
    subGenres: ["Vocal Jazz", "Contemporary Jazz", "Pop"],
    coverImage: "/images/covers/come-away-with-me.jpg",
    theme: "deepRed",
    vinyl: true,
  },
  {
    slug: "ok-computer",
    title: "OK Computer",
    artist: "Radiohead",
    releaseYear: "1997",
    releaseDate: "May 21, 1997",
    pressing: "2017 · 2xLP Vinyl",
    duration: "53:21",
    genre: "Alternative Rock",
    subGenres: ["Art Rock", "Electronic", "Experimental"],
    coverImage: "/images/covers/ok-computer.jpg",
    theme: "forest",
    vinyl: true,
  },
  {
    slug: "legend",
    title: "Legend",
    artist: "Bob Marley & The Wailers",
    releaseYear: "1984",
    releaseDate: "May 8, 1984",
    pressing: "2015 · 180g Vinyl",
    duration: "50:22",
    genre: "Reggae",
    subGenres: ["Roots Reggae", "Dub", "Rocksteady"],
    coverImage: "/images/covers/legend.jpg",
    theme: "mustard",
    vinyl: true,
  },
  {
    slug: "random-access-memories",
    title: "Random Access Memories",
    artist: "Daft Punk",
    releaseYear: "2013",
    releaseDate: "May 17, 2013",
    pressing: "2013 · 2xLP Vinyl",
    duration: "74:24",
    genre: "Electronic",
    subGenres: ["House", "Electropop", "Disco"],
    coverImage: "/images/covers/random-access-memories.jpg",
    theme: "purple",
    vinyl: true,
  },
];

export default function Home() {
  return (
    <div style={{ position: "relative" }}>
      {/* Paper texture — aged-print grain over the cream background.
          Multiply keeps it subtle and darkens the cream where the
          texture has tone. Drop your file at /images/paper-texture.jpg */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.2,
          mixBlendMode: "multiply",
          backgroundImage: "url('/images/paper-texture.jpg')",
          backgroundRepeat: "repeat",
        }}
      />
      {/* Grunge texture — worn, stained edge overlay. Same blend settings.
          Drop your file at /images/grunge-texture.jpg */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.2,
          mixBlendMode: "multiply",
          backgroundImage: "url('/images/grunge-texture.jpg')",
          backgroundRepeat: "repeat",
        }}
      />

      <header style={styles.hero}>
        <div style={styles.heroFade} />
        <div style={styles.heroTitleWrap}>
          <h1 style={styles.heroTitle}>{collection.name}</h1>
        </div>
      </header>

      <section style={styles.intro}>
        <div style={styles.introText}>
          <p style={styles.introKicker}>WHY THIS ARCHIVE</p>
          <h2 style={styles.introTitle}>
            Why I chose Khmer old music
          </h2>
          {/* ─────────────────────────────────────────────────────────────
     EDIT YOUR "WHY" TEXT HERE ↓
     Type your real reason between the {` `} below. Replace this
     whole paragraph with whatever you want on screen.
     Keep Khmer words exactly as they are.
     ───────────────────────────────────────────────────────── */}
          <p style={styles.introPara}>
            {`I grew up hearing the cassette tapes my grandparents kept —
songs carried on the radio before anyone I knew had a record player.
Those melodies hold the voice of Cambodia the way a photograph holds
the light, and I want that voice to survive. This archive is my way
of keeping it close and making it easy for the next person to find.`}
          </p>
        </div>

        <div style={styles.introSingle}>
          <div style={styles.singleFrame}>
            <img
              src="/images/single.png"
              alt={'Sinn Sisamouth - "King of Music"'}
              style={styles.singleImage}
            />
          </div>
          <p style={styles.singleCaption}>
            Sinn Sisamouth - {'"'}King of Music{'"'}
          </p>
        </div>
      </section>

      <section style={styles.musicSection}>
        <p style={styles.musicKicker}>THE COLLECTION</p>
        <h2 style={styles.musicTitle}>Curated Records</h2>
        <p style={styles.musicSub}>A selection of records that shaped the sound — each one catalogued like a museum piece.</p>
        <MusicGrid albums={albums} />
      </section>

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
