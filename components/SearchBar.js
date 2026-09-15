// Vintage-styled search input. Purely presentational — the query value and
// change handler are passed in by the archive that owns the search state.
export default function SearchBar({ value, onChange }) {
  const input = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    fontFamily: "'Kantumruy Pro', Georgia, serif",
    color: "#4A3B2A",
    backgroundColor: "rgba(255,255,255,0.35)",
    border: "1px solid #CFBFA1",
    borderRadius: 10,
    outline: "none",
    "::placeholder": {
      color: "#A08C6F",
    },
    transition: "border-color 220ms ease, box-shadow 220ms ease",
  };

  const wrap = {
    position: "relative",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "20px 0",
  };

  return (
    <div style={wrap}>
      <label
        htmlFor="archive-search"
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
        }}
      >
        Search the collection
      </label>
      <input
        id="archive-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ជ្រៀសជ្រើស — search by title, artist, or genre…"
        aria-label="Search the collection"
        style={input}
      />
    </div>
  );
}