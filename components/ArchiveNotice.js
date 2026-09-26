// The single message box used wherever the collection has no cards to show:
// while the entries are still loading, when the archive has no entries at all,
// and when a search matches nothing. Presentational only — it just draws the
// dashed box and prints the sentence it is given.
export default function ArchiveNotice({ children }) {
  const notice = {
    padding: "40px 20px",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#7A6B53",
    border: "1px dashed #CFBFA1",
    borderRadius: 12,
  };

  return (
    <div style={notice} role="status">
      {children}
    </div>
  );
}
