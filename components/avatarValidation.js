// Profile-picture rules, kept separate from the record-photo checks in
// entryValidation.js because the avatars bucket has its own, smaller limit
// (2 MB versus the 5 MB the vinyl photos allow). Mirror the same OWASP-friendly
// approach: the claimed MIME type and the filename extension must each land in
// the allowlist independently, and the object is uploaded under a name the app
// generates, so a user-supplied filename never reaches storage.

const ALLOWED_AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

// Returns "" when the file is acceptable, otherwise the bilingual message to
// show under the field.
export function validateAvatarFile(file) {
  if (!file) return "Choose a profile picture. / សូមជ្រើសរើសរូបថតប្រវត្តិរូប។";

  const type = file.type || "";
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_AVATAR_TYPES, type)) {
    return "The picture must be a JPG, PNG or WebP image. / រូបភាពត្រូវតែជា JPG, PNG ឬ WebP។";
  }

  // Extension audited as well as the MIME type: claiming image/png while naming
  // the file .webp is the same mismatch the vinyl uploader rejects.
  const extension = (file.name || "").split(".").pop().toLowerCase();
  if (extension !== ALLOWED_AVATAR_TYPES[type]) {
    return `The picture must be a ${ALLOWED_AVATAR_TYPES[type].toUpperCase()} file. / រូបភាពត្រូវតែជាឯកសារ ${ALLOWED_AVATAR_TYPES[type].toUpperCase()}។`;
  }

  if (!file.size || file.size > MAX_AVATAR_BYTES) {
    return "The picture must be 2 MB or smaller. / រូបភាពត្រូវមានទំហំមិនលើសពី 2 MB។";
  }

  return "";
}

export { MAX_AVATAR_BYTES, ALLOWED_AVATAR_TYPES };
