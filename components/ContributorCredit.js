// The "who added this record" line rendered under a published entry's metadata.
// Shows a small circular avatar plus the contributor's public display name,
// crediting the person who filed the record. When no public profile exists we
// fall back to a neutral avatar and "Anonymous contributor", because an entry
// may belong to a legacy row whose owner never created a profile.
//
// The data here is only what is public — display_name and the avatar's public
// URL. Emails are never part of a contributor object: components/
// MusicArchiveFromSupabase.js builds contributor data from the profiles table
// and only its public columns.
export default function ContributorCredit({ contributor, theme }) {
  const displayName = contributor?.displayName || "";
  const avatarUrl = contributor?.avatarUrl || null;

  // Anonymous when there was no profile at all or no public display name.
  const anonymous = !displayName;
  const nameLine = anonymous
    ? "Anonymous contributor / អ្នកចូលរួមដែលមិនបញ្ចេញឈ្មោះ"
    : displayName;

  // Default avatar: a muted note on a tinted disc for anonymous users, or the
  // first letter of the display name when there is a name but no picture.
  const fallbackChar = anonymous
    ? "♪"
    : Array.from(displayName.trim())[0].toLocaleUpperCase();

  return (
    <div style={styles.row(theme)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${displayName || "Contributor"} profile picture`}
          style={styles.avatarImg(theme)}
        />
      ) : (
        <span style={styles.avatarFallback(theme)} aria-hidden="true">
          {fallbackChar}
        </span>
      )}
      <div style={styles.details}>
        <p style={styles.label(theme)}>Contributed by / ចូលរួមចំណែកដោយ</p>
        <p style={styles.name(theme)}>{nameLine}</p>
      </div>
    </div>
  );
}

// Colours come from the card's own theme (passed in), so the credit block keeps
// quietly on whatever vintage palette the record card already uses — no hard-
// coded colour breaks the card's look.
const styles = {
  row: (theme) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px solid ${theme.divider}`,
  }),
  avatarImg: (theme) => ({
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.card,
  }),
  avatarFallback: (theme) => ({
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    backgroundColor: theme.pillBg,
    border: `1px solid ${theme.accent}55`,
    color: theme.accent,
  }),
  details: { minWidth: 0 },
  label: (theme) => ({
    margin: 0,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.sub,
  }),
  name: (theme) => ({
    margin: "2px 0 0",
    fontSize: 14,
    fontWeight: 500,
    color: theme.ink,
    overflowWrap: "anywhere",
  }),
};
