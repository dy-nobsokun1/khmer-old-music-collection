import { validateImageFile } from "./entryValidation.js";
import { createClient } from "../utils/supabase/client.js";

// Puts the contributor's photo in Supabase Storage and hands back the public URL
// to store in entries.vinyl_image.
//
// Follows current OWASP guidance for uploads in four ways:
//
//  1. Allowlist, not blocklist. Only the MIME types in entryValidation.js are
//     accepted; "is it not executable" is not a question we can answer by
//     guessing at extensions.
//  2. The stored name is generated here — a random UUID plus an extension we
//     chose from the allowlist. The uploaded file's own name is never used for
//     the path, so "photo.jpg" cannot become "../../etc/passwd" or overwrite a
//     neighbour's file, and no user-supplied text reaches the storage key.
//  3. upsert is false. A name collision fails loudly instead of silently
//     overwriting an existing object.
//  4. The image is served from the bucket's public URL, not executed in place,
//     and only the public read path is ever exposed — no signed URL is stored.
//
// Returns the public URL string. Throws an Error with a short, non-technical
// message that is safe to show a contributor; the underlying Supabase failure
// is logged here and never propagated to the screen.
export default async function uploadVinylImage(file, userId) {
  // Re-checked here on purpose. The form validates too, but the uploader is the
  // thing standing between the file and storage, so it does not assume a caller
  // ran that check first.
  const rejection = validateImageFile(file);
  if (rejection) throw new Error(rejection);

  const supabase = createClient();

  // Extension comes from the allowlist keyed by the accepted MIME type, never
  // from the filename, so the stored extension always matches a type we allow.
  const extension = EXTENSION_FOR_TYPE[file.type];

  // A random v4 UUID per upload. crypto.randomUUID is built into the browser,
  // so this needs no dependency.
  const objectPath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      // Sent explicitly rather than left to the browser's guess, so the object
      // is stored with the type we validated instead of whatever was claimed.
      contentType: file.type,
    });

  if (uploadError) {
    console.error(
      "[contribute] photo upload failed:",
      uploadError.code,
      uploadError.message
    );
    throw new Error("The photo could not be uploaded. Please try again.");
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;

  if (!publicUrl) {
    console.error("[contribute] photo uploaded but no public URL was returned");
    throw new Error("The photo could not be prepared. Please try again.");
  }

  return publicUrl;
}

// Mirrors the allowlist in entryValidation.js. Kept as its own tiny literal so
// this module has no circular import back into the validator's internals.
const EXTENSION_FOR_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};