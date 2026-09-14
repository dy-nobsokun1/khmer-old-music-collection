// A single metadata row: a small, muted line-glyph plus a label/value pair.
// Icons stay small so they never compete with the album artwork.
export default function MetaRow({ icon, label, value, theme }) {
  const style = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };
  const iconStyle = {
    width: 22,
    textAlign: "center",
    fontSize: 14,
    color: theme.accent,
    opacity: 0.85,
  };
  const labelStyle = {
    fontSize: 12,
    letterSpacing: 1,
    color: theme.sub,
    textTransform: "uppercase",
    flex: "0 0 auto",
    minWidth: 78,
  };
  const valueStyle = {
    fontSize: 14,
    color: theme.ink,
    flex: 1,
    textAlign: "right",
  };

  return (
    <div style={style}>
      <span aria-hidden="true" style={iconStyle}>
        {icon}
      </span>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}