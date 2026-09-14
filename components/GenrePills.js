// Genre tags: the primary genre is a filled, prominent pill; sub-genres are
// smaller and lighter. Renders none if there is no genre.
export default function GenrePills({ genre, subGenres, theme }) {
  const pill = {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 11px",
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: 0.5,
    color: theme.pillInk,
    backgroundColor: theme.pillBg,
    border: `1px solid ${theme.accent}33`,
    marginRight: 6,
    transition: "background-color 220ms ease",
  };
  const subPill = {
    ...pill,
    padding: "2px 9px",
    fontSize: 11,
    opacity: 0.92,
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {genre && <span style={pill}>{genre}</span>}
      {(subGenres || []).map((s) => (
        <span key={s} style={subPill}>
          {s}
        </span>
      ))}
    </div>
  );
}