// Account details are supplied by the reviewer-only database function.
export default function ReviewContributor({ contributor, unavailable }) {
  const name = contributor?.display_name;
  const email = contributor?.email;
  const label = name || email;
  const initials = label
    ? Array.from(label.trim())[0].toLocaleUpperCase()
    : "?";

  return (
    <div style={styles.row}>
      <span style={styles.avatar} aria-hidden="true">{initials}</span>
      <div style={styles.details}>
        <p style={styles.label}>Contributor / អ្នកចូលរួមចំណែក</p>
        <p style={styles.name}>
          {label || (unavailable ? "Contributor details unavailable" : "Unknown contributor")}
        </p>
        {name && email ? <p style={styles.email}>{email}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 0", borderTop: "1px solid #CFBFA1",
    borderBottom: "1px solid #CFBFA1",
  },
  avatar: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 48, height: 48, flexShrink: 0, borderRadius: "50%",
    backgroundColor: "#E9D6B8", border: "1px solid #B99A76",
    color: "#71472D", fontSize: 22, fontWeight: 600,
  },
  details: { minWidth: 0, borderLeft: "1px solid #CFBFA1", paddingLeft: 14 },
  label: { margin: "0 0 4px", fontSize: 13, color: "#7A6B53" },
  name: { margin: 0, fontSize: 16, fontWeight: 600, color: "#4A3B2A", overflowWrap: "anywhere" },
  email: { margin: "4px 0 0", fontSize: 13, color: "#7A6B53", overflowWrap: "anywhere" },
};
