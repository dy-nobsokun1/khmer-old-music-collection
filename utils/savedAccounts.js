// Saved choices are email addresses only. Authentication still happens at login.
export const SAVED_ACCOUNTS_KEY = "archive-saved-accounts";

export function readSavedAccounts() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVED_ACCOUNTS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    const emails = saved.filter((email) => typeof email === "string" &&
      email.length <= 254 && email.includes("@") && email === email.trim());
    return emails.filter((email, index) => emails.findIndex((other) =>
      other.toLowerCase() === email.toLowerCase()) === index);
  } catch {
    return [];
  }
}

function saveAccounts(emails) {
  try {
    window.localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(emails));
  } catch {
    // Browsers can disable local storage; the current account still works.
  }
  return emails;
}

export function rememberAccount(email) {
  const saved = readSavedAccounts();
  if (!email) return saved;
  return saveAccounts([email, ...saved.filter((other) => other.toLowerCase() !== email.toLowerCase())]);
}

export function forgetAccount(email) {
  return saveAccounts(readSavedAccounts().filter((other) => other.toLowerCase() !== email.toLowerCase()));
}
