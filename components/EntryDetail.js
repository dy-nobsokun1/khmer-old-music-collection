"use client";
import { useTranslation } from "./LanguageProvider.js";
import { useState } from "react";
import AlbumThemes from "./AlbumThemes.js";
import MetaRow from "./MetaRow.js";
import EditEntryForm from "./EditEntryForm.js";
import DeleteEntryButton from "./DeleteEntryButton.js";
import ContributorCredit from "./ContributorCredit.js";
import { styles } from "./contributeStyles.js";

// One entry, on its own page.
//
// Editing happens right here rather than on a separate /edit route: when the
// owner starts an edit, this component swaps the reading view for the same form
// /contribute uses, and the Cancel button swaps it back.
//
// isOwner arrives as a boolean decided on the server. The owner's user id never
// comes to the browser at all, so there is nothing here to tamper with; the
// database still decides who may actually write (db/002_entries_owner_policies.sql).
export default function EntryDetail({ entry, isOwner, userId, contributor = null }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const theme = AlbumThemes[entry.theme] || AlbumThemes.cream;

  if (editing) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>{t("EDITING ENTRY")}</p>
          <h1 style={styles.title}>{entry.title}</h1>
          <EditEntryForm
            entry={entry}
            userId={userId}
            onCancel={() => setEditing(false)}
          />
        </div>
      </main>
    );
  }

  const subGenres = (entry.sub_genres || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <p style={styles.kicker}>{t("RECORD")}</p>
        <h1 style={styles.title}>{entry.title}</h1>
        {entry.artist ? <p style={styles.sub}>{entry.artist}</p> : null}

        {entry.vinyl_image ? (
          <figure style={styles.detailFigure}>
            <img
              src={entry.vinyl_image}
              alt={t("Record image: {title}", { title: entry.title })}
              style={styles.detailImage}
            />
          </figure>
        ) : null}

        {/* Reuses the card metadata rows and the record's own theme colours, so
            the detail view reads as the same object the grid card does. */}
        <div style={{ ...styles.detailMeta, backgroundColor: theme.card, borderColor: theme.border }}>
          <MetaRow icon="🕐" label={t("English title")} value={slugToEnglishTitle(entry.slug)} theme={theme} />
          <MetaRow icon="📅" label={t("Released")} value={String(entry.release_year ?? entry.release_date ?? t("Unknown"))} theme={theme} />
          <MetaRow icon="💿" label={t("Pressing")} value={entry.pressing || t("Unknown")} theme={theme} />
          <MetaRow icon="🎵" label={t("Genre")} value={t(entry.genre)} theme={theme} />
          <MetaRow icon="⏱" label={t("Duration")} value={entry.duration} theme={theme} />
          {subGenres.length ? (
            <MetaRow icon="🏷" label={t("Sub-genres")} value={subGenres.join(", ")} theme={theme} />
          ) : null}
          <MetaRow icon="💽" label={t("Vinyl")} value={entry.vinyl ? t("Yes") : t("No")} theme={theme} />
        </div>

        <ContributorCredit contributor={contributor} theme={theme} />

        {isOwner ? (
          <div style={styles.ownerActions}>
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={styles.secondaryButton}
            >
              {t("Edit")}
            </button>
            <DeleteEntryButton entryId={entry.id} entryTitle={entry.title} />
          </div>
        ) : null}

        <p style={styles.hint}>
          <a href="/" style={styles.backInline}>{t("Back to the archive")}</a>
        </p>
      </div>
    </main>
  );
}

// "som-bour-meas" -> "som bour meas". The same conversion the grid uses, kept
// here so the two never disagree about what an English title looks like.
function slugToEnglishTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}
