// Shared styling for the /contribute form, kept in one place so the page, the
// form, and each field all speak the same visual language. Plain style objects,
// matching the convention already used in app/page.js — no CSS framework and no
// stylesheet. The palette is the archive's: paper cream, deep sepia ink, muted
// terracotta rust, and the espresso browns from components/AuthCard.js.
const ink = "#4A3B2A";
const rust = "#A65A3C";
const sub = "#7A6B53";

export const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F3C7",
    padding: "48px 24px 72px",
    fontFamily: "'Kantumruy Pro', Georgia, 'Times New Roman', serif",
    color: ink,
  },
  shell: { maxWidth: 720, margin: "0 auto" },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: rust,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  },
  title: { fontSize: 32, fontWeight: 500, letterSpacing: 1, margin: "10px 0 6px" },
  sub: { fontSize: 15, color: sub, lineHeight: 1.6, margin: "0 0 28px" },
  form: {
    backgroundColor: "#F7EEDB",
    border: "1px solid #CFBFA1",
    borderRadius: 16,
    padding: "28px 26px",
    boxShadow: "0 6px 12px rgba(74,59,42,0.14)",
  },
  row: { display: "flex", gap: 18, flexWrap: "wrap" },
  field: { flex: "1 1 240px", minWidth: 0, marginBottom: 18 },
  label: { display: "block", fontSize: 13, letterSpacing: 1, color: ink, marginBottom: 6 },
  required: { color: rust },
  control: {
    width: "100%",
    padding: "11px 12px",
    fontSize: 16,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: ink,
    backgroundColor: "#FFFDF2",
    border: "1px solid #CFBFA1",
    borderRadius: 8,
    outline: "none",
  },
  invalid: { borderColor: "#B3402A", backgroundColor: "#FDF0EC" },
  hint: { margin: "6px 0 0", fontSize: 12, color: sub, lineHeight: 1.5 },
  error: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#B3402A",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  formError: {
    margin: "4px 0 18px",
    padding: "12px 14px",
    fontSize: 14,
    color: "#8A2F1D",
    backgroundColor: "#FDF0EC",
    border: "1px solid #E0B48A",
    borderRadius: 8,
    lineHeight: 1.5,
  },
  button: {
    width: "100%",
    padding: "14px 0",
    fontSize: 16,
    cursor: "pointer",
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#FFFDF2",
    backgroundColor: rust,
    border: "none",
    borderRadius: 8,
  },
  buttonBusy: { opacity: 0.6, cursor: "not-allowed" },
  back: { display: "inline-block", marginTop: 22, fontSize: 14, color: rust },
  // An inline link inside body copy, as opposed to `back` which is a standalone
  // link on its own line.
  backInline: { color: rust, textDecoration: "underline" },
  // A link styled to read like the form's submit button, for the logged-out
  // page where there is no form to submit.
  buttonLink: {
    display: "block",
    marginTop: 20,
    padding: "13px 0",
    textAlign: "center",
    fontSize: 15,
    textDecoration: "none",
    color: "#FFFDF2",
    backgroundColor: rust,
    borderRadius: 8,
  },
};

export default styles;