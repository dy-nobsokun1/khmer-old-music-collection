import AlbumThemes from "./AlbumThemes.js";

// Shared styling for the review queue (app/review and the client board that
// renders each pending entry). Same palette language as contributeStyles.js —
// paper cream, sepia ink, muted terracotta — and the cream card colours are
// reused from AlbumThemes so a review card reads as the same object the
// archive grid shows.

const ink = "#4A3B2A";
const rust = "#A65A3C";
const sub = "#7A6B53";

// The cream record theme: the review card's paper tones and meta colours.
export const theme = AlbumThemes.cream;

export const cardStyles = {
  list: {
    listStyle: "none",
    padding: 0,
    margin: "24px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  // One pending entry, as a clean paper card.
  card: {
    backgroundColor: theme.card,
    border: "1px solid " + theme.border,
    borderRadius: 16,
    boxShadow: "0 6px 12px rgba(74,59,42,0.14)",
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  // Image on the left, details on the right; wraps so the image sits above
  // the details on narrow screens.
  cardTop: {
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  imageWrap: {
    flex: "0 1 200px",
    minWidth: 140,
    maxWidth: "100%",
  },
  image: {
    display: "block",
    width: "100%",
    height: "auto",
    border: "1px solid #CFBFA1",
    borderRadius: 10,
    backgroundColor: "#FFFDF2",
  },
  info: { flex: "1 1 280px", minWidth: 0 },
  title: {
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: 0.5,
    color: theme.ink,
    margin: 0,
  },
  artist: {
    fontSize: 14,
    letterSpacing: 1,
    color: theme.sub,
    margin: "4px 0 0",
  },
  divider: {
    borderTop: "1px solid " + theme.divider,
    margin: "14px 0 12px",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  publishButton: {
    flex: "1 1 auto",
    padding: "11px 22px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#FFFDF2",
    backgroundColor: rust,
    border: "1px solid " + rust,
    borderRadius: 8,
  },
  returnButton: {
    flex: "1 1 auto",
    padding: "11px 22px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: ink,
    backgroundColor: "transparent",
    border: "1px solid #CFBFA1",
    borderRadius: 8,
  },
  busy: { opacity: 0.6, cursor: "not-allowed" },
  error: {
    margin: "24px 0 0",
    padding: "12px 14px",
    fontSize: 14,
    color: "#8A2F1D",
    backgroundColor: "#FDF0EC",
    border: "1px solid #E0B48A",
    borderRadius: 8,
    lineHeight: 1.5,
  },
};

// Styling for the Return confirmation dialog (components/ReturnForm.js). Same
// palette and corner language as the rest of the review queue: paper cream,
// sepia ink, muted terracotta rust.
export const returnStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(74,59,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#F7EEDB",
    border: "1px solid #CFBFA1",
    borderRadius: 16,
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
    padding: "22px",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
  },
  heading: { margin: "0 0 4px", fontSize: 18, fontWeight: 500, color: ink },
  entryTitle: { margin: "0 0 14px", fontSize: 14, color: theme.sub },
  label: {
    display: "block",
    fontSize: 13,
    letterSpacing: 1,
    color: ink,
    marginBottom: 6,
  },
  required: { color: rust },
  textarea: {
    width: "100%",
    minHeight: 96,
    padding: "10px 12px",
    fontSize: 15,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: ink,
    backgroundColor: "#FFFDF2",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#CFBFA1",
    borderRadius: 8,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  invalid: { borderColor: "#B3402A", backgroundColor: "#FDF0EC" },
  hint: { margin: "6px 0 0", fontSize: 12, color: sub, lineHeight: 1.5 },
  error: {
    margin: "10px 0 0",
    padding: "10px 12px",
    fontSize: 13,
    color: "#8A2F1D",
    backgroundColor: "#FDF0EC",
    border: "1px solid #E0B48A",
    borderRadius: 8,
    lineHeight: 1.5,
  },
  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancel: {
    padding: "10px 18px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: ink,
    backgroundColor: "transparent",
    border: "1px solid #CFBFA1",
    borderRadius: 8,
  },
  confirm: {
    padding: "10px 18px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#FFFDF2",
    backgroundColor: rust,
    border: "1px solid " + rust,
    borderRadius: 8,
  },
  busy: { opacity: 0.6, cursor: "not-allowed" },
};
