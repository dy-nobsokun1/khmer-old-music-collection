import collection from "../collection.config.js";
import MusicArchive from "../components/MusicArchive.js";
import MusicArchiveFromSupabase from "../components/MusicArchiveFromSupabase.js";
import { createClient } from "../utils/supabase/server.js";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

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
  // Small account strip pinned to the top-right of the hero banner. Uses the
  // same paper-cream pill as the page so it stays legible over the photo.
  authBar: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 3,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 14px",
    backgroundColor: "rgba(245,243,199,0.92)",
    border: "1px solid #CFBFA1",
    borderRadius: 999,
    color: ink,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
  },
  authEmail: {
    fontSize: 14,
    color: ink,
  },
  authLink: {
    fontSize: 14,
    color: rust,
    textDecoration: "none",
  },
  authSeparator: {
    fontSize: 13,
    color: "#A08C6F",
  },
  logoutButton: {
    border: "none",
    background: "none",
    padding: 0,
    fontSize: 14,
    color: rust,
    textDecoration: "underline",
    cursor: "pointer",
  },
};

// The archive's album collection, kept here as the original hand-written
// record list. The page no longer reads it: the collection section below is
// loaded from the Supabase `entries` table by MusicArchiveFromSupabase. This
// list stays in the repo as the reference for what the archive should contain.
const albums = [
  {
    slug: "som-bour-meas",
    title: "សំបូរមាស",
    englishTitle: "Som Bour Meas",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "Pre-1975",
    releaseDate: "Unknown",
    pressing: "Olympic · 45-8013-B",
    duration: "Unknown",
    genre: "Khmer Traditional",
    subGenres: ["Kbach Folk", "Khmer Folk", "Romantic"],
    vinylImage: "/images/vinyl 2.png",
    theme: "mustard",
    vinyl: true,
  },

  {
    slug: "oun-proam-smuhk",
    title: "អូនព្រមស្ម័គ្រ",
    englishTitle: "Oun Proam Smuhk",
    artist: "ហួយ មាស (Huoy Meas)",
    releaseYear: "1975",
    releaseDate: "Unknown",
    pressing: "Unknown",
    duration: "02:13",
    genre: "Khmer Traditional",
    subGenres: ["Khmer Folk", "Romantic", "Traditional"],
    vinylImage: "/images/vinyl 3.png",
    theme: "cream",
    vinyl: true,
  },

  {
    slug: "tngai-chey",
    title: "ថ្ងៃជ័យ",
    englishTitle: "Tngai Chey",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "1965",
    releaseDate: "Unknown",
    pressing: "Unknown",
    duration: "05:01",
    genre: "Khmer Traditional",
    subGenres: ["Khmer Folk", "Traditional"],
    vinylImage: "/images/vinyl 5.png",
    theme: "deepRed",
    vinyl: true,
  },

  {
    slug: "bela-cha-cha-cha",
    title: "បេឡា ចា៎ ចា៎ ចា៎",
    englishTitle: "Bela Cha Cha Cha",
    artist: "ប៉ែន រ៉ន (Pen Ran)",
    releaseYear: "1966",
    releaseDate: "1966",
    pressing: "Angkor · 45 RPM Vinyl",
    duration: "02:55",
    genre: "Khmer Pop",
    subGenres: ["Cha Cha Cha", "Afro-Cuban", "Khmer Golden Era"],
    vinylImage: "/images/vinyl 6.png",
    theme: "forest",
    vinyl: true,
  },

  {
    slug: "Som Bong Lerng Rom",
    title: "សូមបងឡើងរាំ",
    englishTitle: "Som Bong Lerng Rom",
    artist: "ប៉ែន រ៉ន (Pen Ran)",
    releaseYear: "1975",
    releaseDate: "Unknown",
    pressing: "វិមានឯករាជ្យ · 45-2970 · Side A",
    duration: "02:48",
    genre: "Khmer Pop",
    subGenres: ["Cha Cha Cha", "Afro-Cuban", "Khmer Golden Era"],
    vinylImage: "/images/vinyl 4.png",
    theme: "forest",
    vinyl: true,
  },

  {
    slug: "Mok Rom Chea Muoy Chan Chhaya",
    title: "មករាំជាមួយច័ន្ទឆាយា",
    englishTitle: "Mok Rom Chea Muoy Chan Chhaya",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "1975",
    releaseDate: "Unknown",
    pressing: "Unknown",
    duration: "02:32",
    genre: "Khmer Pop",
    subGenres: ["Cha Cha Cha", "Afro-Cuban", "Khmer Golden Era"],
    vinylImage: "/images/vinyl 1.png",
    theme: "forest",
    vinyl: true,
  },

  {
    slug: "antonietta",
    title: "អង់តូនីញែតា",
    englishTitle: "Antonietta",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "1967",
    releaseDate: "Unknown",
    pressing: "Wat Phnom",
    duration: "02:33",
    genre: "Khmer Rock",
    vinylImage: "/images/vinyl 7.png",
    theme: "deepRed",
    vinyl: true,
  },

  {
    slug: "marina",
    title: "ម៉ារីណា",
    englishTitle: "Marina",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "1968",
    releaseDate: "Unknown",
    pressing: "Wat Phnom Record",
    duration: "02:45",
    genre: "Latin",
    vinylImage: "/images/vinyl 8.png",
    theme: "deepRed",
    vinyl: true,
  },

  {
    slug: "love-satisfaction",
    title: "ស្រឡាញ់ពេញចិត្ត",
    englishTitle: "Love Satisfaction",
    artist: "ស៊ីន ស៊ីសាមុត (Sinn Sisamouth)",
    releaseYear: "1966",
    releaseDate: "Unknown",
    pressing: "Wat Phnom Record",
    duration: "02:49",
    genre: "Rock and Roll",
    vinylImage: "/images/vinyl 9.png",
    theme: "forest",
    vinyl: true,
  },

  {
    slug: "oun-chong-rom-leng",
    title: "អូនចង់រាំលេង",
    englishTitle: "Oun Chong Rom Leng",
    artist: "រស់ សេរីសុទ្ធា (Ros Sereysothea)",
    releaseYear: "1970",
    releaseDate: "Unknown",
    pressing: "Thas Meas Record",
    duration: "03:16",
    genre: "Cambodian Vintage Rock",
    vinylImage: "/images/vinyl 10.png",
    theme: "deepRed",
    vinyl: true,
  },

  {
    slug: "rom-ping-rom-ping",
    title: "រំពឹង រំពឹង",
    englishTitle: "Rom Ping Rom Ping",
    artist: "រស់ សេរីសុទ្ធា (Ros Serey Sothea)",
    releaseYear: "1971",
    releaseDate: "Unknown",
    pressing: "Monorom",
    duration: "04:23",
    genre: "Slow Rock",
    vinylImage: "/images/vinyl 11.png",
    theme: "forest",
    vinyl: true,
  },
];



// Logs the current user out. Runs as a Server Action, so it can clear the
// session cookie on the server and then re-serve fresh markup so the header
// immediately reflects the logged-out state.
export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "page");
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        {/* Account strip: logged-in users see their email + a log-out button;
            visitors see links to the login and sign-up pages. */}
        <div style={styles.authBar}>
          {user ? (
            <>
              <span style={styles.authEmail}>{user.email}</span>
              <button
                type="button"
                onClick={signOut}
                style={styles.logoutButton}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={styles.authLink}>Log in</a>
              <span style={styles.authSeparator}>·</span>
              <a href="/signup" style={styles.authLink}>Sign up</a>
            </>
          )}
        </div>
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

      {/* The collection comes from Supabase. The query runs on the server
          inside this boundary, so everything above (hero, intro, account
          strip) renders straight away and only the record grid waits. The
          fallback is the same archive view with no records, which shows the
          "Loading the collection…" notice in the same dashed box the empty
          and no-results states use. */}
      <Suspense fallback={<MusicArchive albums={[]} loading />}>
        <MusicArchiveFromSupabase />
      </Suspense>
    </div>
  );
}
