import MetaRow from "./MetaRow.js";
import ReviewContributor from "./ReviewContributor.js";
import { cardStyles, theme } from "./reviewStyles.js";

// One pending entry in the review queue, presented as a clean card for a
// decision. Purely presentational: the Publish and Return callbacks come from
// the client ReviewBoard, which also disables the buttons while its request to
// the database's review_entry function is still in flight.
export default function ReviewCard({ entry, busy, onPublish, onReturn }) {
  return (
    <li style={cardStyles.card}>
      <div style={cardStyles.cardTop}>
        {entry.vinyl_image ? (
          <div style={cardStyles.imageWrap}>
            <img
              src={entry.vinyl_image}
              alt={`${entry.title} record`}
              style={cardStyles.image}
            />
          </div>
        ) : null}

        <div style={cardStyles.info}>
          <h2 style={cardStyles.title}>{entry.title}</h2>
          {entry.artist ? (
            <p style={cardStyles.artist}>{entry.artist}</p>
          ) : null}

          <div style={cardStyles.divider} />

          <MetaRow
            icon="🕐"
            label="Year"
            value={entry.release_year ?? "Unknown"}
            theme={theme}
          />
          <MetaRow icon="🎵" label="Genre" value={entry.genre} theme={theme} />
          <MetaRow
            icon="⏱"
            label="Duration"
            value={entry.duration}
            theme={theme}
          />
          <MetaRow
            icon="📅"
            label="Submitted"
            value={formatDate(entry.created_at)}
            theme={theme}
          />
        </div>
      </div>

      <ReviewContributor contributor={entry.contributor} unavailable={entry.contributorUnavailable} />

      <div style={cardStyles.actions}>
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          style={
            busy
              ? { ...cardStyles.publishButton, ...cardStyles.busy }
              : cardStyles.publishButton
          }
        >
          Publish · បោះពុម្ពផ្សាយ
        </button>
        <button
          type="button"
          onClick={onReturn}
          disabled={busy}
          style={
            busy
              ? { ...cardStyles.returnButton, ...cardStyles.busy }
              : cardStyles.returnButton
          }
        >
          Return · បញ្ជូនត្រឡប់
        </button>
      </div>
    </li>
  );
}

// created_at -> “3 February 2026”. Unknown or unparseable values pass through
// as-is rather than crashing the card.
function formatDate(iso) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
