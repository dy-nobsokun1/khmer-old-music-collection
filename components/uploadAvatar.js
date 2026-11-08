import { validateAvatarFile } from "./avatarValidation.js";
import { createClient } from "../utils/supabase/client.js";

// Puts the contributor's profile picture in the avatars bucket and returns the
// stored object path plus its public URL.
//
// The profiles.avatar_path column stores the object path (for example
// "<user_id>/<uuid>.jpg"), not the full URL. Cards and the profile page turn
// that path into a public URL with getPublicUrl, which keeps every avatar
// working even if the project's storage URL ever changes.
//
// The folder is taken from the browser's OWN session (supabase.auth.getUser),
// never from a prop. The two Storage policies (the permissive owner policy and
// the restrictive guard in db/004_public_profiles.sql) require the object's
// first path segment to equal auth.uid(), so building the path from the same
// session that authenticates the upload guarantees the INSERT is allowed —
// and if there is no session, we fail with a clear message instead of a raw
// row-level-security error.
//
// The stored name is generated here — a random UUID plus an extension chosen
// from the allowlist — matching the pattern the avatars Storage policy and the
// profiles.avatar_path CHECK constraint expect. No user-supplied filename
// reaches the bucket, and upsert is false so a collision fails loudly instead
// of quietly overwriting an existing object.
export default async function uploadAvatar(file) {
  // Re-checked here even though the form validates too: the uploader is the
  // thing standing between the file and storage, so it must not assume the
  // caller already ran the check.
  const rejection = validateAvatarFile(file);
  if (rejection) throw new Error(rejection);

  const supabase = createClient();

  // Only a signed-in contributor may upload. Deriving the user id here — rather
  // than accepting it as a prop — keeps the storage folder identical to the
  // auth.uid() the Storage policies compare against.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You need to be signed in to change your picture. / អ្នកត្រូវចូលគណនី ទើបអាចប្តូររូបភាពបាន។"
    );
  }

  // Extension comes from the allowlist keyed by the accepted MIME type, never
  // from the filename, so the stored extension always matches a type we allow.
  const extension = EXTENSION_FOR_TYPE[file.type];

  // A random v4 UUID per upload. crypto.randomUUID is built into the browser,
  // so this needs no dependency.
  const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error(
      "[profile] avatar upload failed:",
      uploadError.code,
      uploadError.message,
      "(path " + objectPath + ")"
    );
    // Carry the code so a genuine RLS/session problem (a storage AccessDenied)
    // is distinguishable from a transient network failure, while the message
    // shown stays bilingual and non-technical.
    const err = new Error(
      "The picture could not be uploaded. Please try again. / រូបភាពមិនអាចផ្ទុកឡើងបានទេ។ សូមព្យាយាមម្តងទៀត។"
    );
    err.code = uploadError.code;
    throw err;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;

  if (!publicUrl) {
    console.error("[profile] avatar uploaded but no public URL was returned");
    throw new Error("The picture could not be prepared. Please try again. / រូបភាពមិនអាចរៀបចំបានទេ។ សូមព្យាយាមម្តងទៀត។");
  }

  return { path: objectPath, url: publicUrl };
}

// Mirrors the allowlist in avatarValidation.js. Kept as its own tiny literal so
// this module has no circular import back into the validator's internals.
const EXTENSION_FOR_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
