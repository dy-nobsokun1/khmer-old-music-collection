import messages from "./messages.js";

export function translate(text, language, values = {}) {
  if (typeof text !== "string") return text;
  const key = text.replace(/\s+/g, " ").trim();
  // Validation includes the actual year or image format in these messages.
  const year = key.match(/^Use a year between 1900 and (\d{4})\.$/);
  if (year) return translate("Use a year between 1900 and {year}.", language, { year: year[1] });
  const image = key.match(/^The photo must be a (JPG|PNG|WEBP) file\.$/);
  if (image) return translate("The photo must be a {type} file.", language, { type: image[1] });
  // Several existing messages already contain both languages.
  const bilingual = key.match(/^(.+?)\s(?:\/|·)\s(.+)$/);
  const translated = language === "km" && Object.prototype.hasOwnProperty.call(messages, key)
    ? messages[key] : null;
  const hasKhmer = bilingual && /[\u1780-\u17ff]/.test(bilingual[2]);
  const result = translated ?? (hasKhmer ? bilingual[language === "km" ? 2 : 1] : text);
  return result.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  );
}
