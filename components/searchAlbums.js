import { translate } from "../utils/i18n/translate.js";

// Case-insensitive search across every text field shown on a card.
// Works for both Latin and Khmer (Khmer has no case, so lowercasing is safe
// and substring matching handles partial names/titles).
export default function searchAlbums(albums, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return albums;

  return albums.filter((a) => {
    const haystack = [
      a.title,
      a.englishTitle,
      a.artist,
      a.genre,
      translate(a.genre, "km"),
      ...(a.subGenres || []),
      ...(a.subGenres || []).map((name) => translate(name, "km")),
      a.releaseYear,
      a.releaseDate,
      a.pressing,
      a.duration,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
