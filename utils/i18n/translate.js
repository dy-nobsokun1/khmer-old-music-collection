import messages from "./messages.js";

export function translate(text, language, values = {}) {
  if (typeof text !== "string") return text;
  const key = text.replace(/\s+/g, " ").trim();
  // Supabase supplies the configured password rules, including combined failures.
  const passwordParts = key.split(/\. (?=Password (?:should|is known))/);
  if (key.startsWith("Password ") && passwordParts.length > 1) {
    return passwordParts.map((part, index) =>
      translate(index < passwordParts.length - 1 ? `${part}.` : part, language)
    ).join(" ");
  }
  const passwordLength = key.match(/^Password should be at least (\d+) characters\.$/);
  if (passwordLength) return translate("Use at least {count} characters for your password.", language, { count: passwordLength[1] });
  const passwordCharacters = key.match(/^Password should contain at least one character of each: (.+)\.$/);
  if (passwordCharacters) {
    const groups = passwordCharacters[1].split(", ").map((characters) => {
      const labels = {
        abcdefghijklmnopqrstuvwxyz: "a lowercase letter (a-z)",
        ABCDEFGHIJKLMNOPQRSTUVWXYZ: "an uppercase letter (A-Z)",
        "0123456789": "a number (0-9)",
      };
      return labels[characters] ? translate(labels[characters], language)
        : translate('one character from "{characters}"', language, { characters });
    });
    return translate("Your password must include at least one of each: {groups}.", language, { groups: groups.join(", ") });
  }
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
