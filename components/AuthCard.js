"use client";
import { useState } from "react";

// Shared auth card for the /login and /signup pages. Presentational only: the
// parent page owns the auth call and passes it in as `onSubmit(email, password)`,
// which must return a promise that resolves once the attempt has finished.
// Uses the same palette as app/page.js (ink, rust, paper, espresso) flipped onto
// a dark espresso background so the auth flow reads as its own space.
export default function AuthCard({
  kicker,
  title,
  subtitle,
  submitLabel,
  error,
  notice,
  footerHref,
  footerText,
  passwordAutoComplete = "current-password",
  onSubmit,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    Promise.resolve(onSubmit(email.trim(), password)).finally(() => setBusy(false));
  };

  const s = {
    page: { minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", backgroundColor: "#24150D", padding: "40px 16px",
      minWidth: 280 },
    card: { width: 380, maxWidth: "100%", backgroundColor: "#3A2317",
      border: "1px solid #5C3A21", borderRadius: 12, padding: "28px 26px",
      boxShadow: "0 12px 28px rgba(0,0,0,0.45)" },
    kicker: { fontFamily: "'Courier New', monospace", color: "#A65A3C",
      fontSize: 13, letterSpacing: 3, textTransform: "uppercase", margin: 0 },
    title: { fontSize: 28, fontWeight: 500, color: "#F5F3C7",
      fontFamily: "'Kantumruy Pro', Georgia, serif", letterSpacing: 1,
      margin: "10px 0 4px" },
    subtitle: { fontSize: 14, color: "#A08C6F", lineHeight: 1.5, margin: "0 0 22px" },
    label: { fontSize: 13, color: "#CFBFA1", display: "block", margin: "0 0 8px" },
    input: { width: "100%", padding: "12px 14px", fontSize: 16, color: "#F5F3C7",
      backgroundColor: "#24150D", border: "1px solid #5C3A21", borderRadius: 8,
      outline: "none", fontFamily: "'Kantumruy Pro', Georgia, serif" },
    button: { width: "100%", padding: "14px 0", fontSize: 16, cursor: "pointer",
      color: "#24150D", backgroundColor: "#A65A3C", border: "none", borderRadius: 8,
      fontFamily: "'Kantumruy Pro', Georgia, serif", opacity: busy ? 0.6 : 1 },
    notice: { margin: "16px 0 0", color: "#C7E0B4", fontSize: 14, textAlign: "center" },
    error: { margin: "16px 0 0", color: "#E0B48A", fontSize: 14, textAlign: "center" },
    footer: { margin: "20px 0 4px", fontSize: 14, color: "#CFBFA1", textAlign: "center" },
    link: { color: "#A65A3C", textDecoration: "underline" },
  };

  return (
    <div style={s.page}>
      <form onSubmit={submit} style={s.card} aria-label={title}>
        <p style={s.kicker}>{kicker}</p>
        <h1 style={s.title}>{title}</h1>
        {subtitle ? <p style={s.subtitle}>{subtitle}</p> : null}

        <label htmlFor="auth-email" style={s.label}>Email</label>
        <input id="auth-email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} />

        <label htmlFor="auth-password" style={{ ...s.label, margin: "18px 0 0" }}>
          Password
        </label>
        <input id="auth-password" type="password" required
          autoComplete={passwordAutoComplete}
          value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} />

        <button type="submit" disabled={busy} style={s.button}>
          {busy ? "One moment…" : submitLabel}
        </button>

        {notice ? <p style={s.notice} role="status">{notice}</p> : null}
        {error ? <p style={s.error} role="alert">{error}</p> : null}

        <p style={s.footer}>
          <a href={footerHref} style={s.link}>{footerText}</a>
        </p>
      </form>
    </div>
  );
}