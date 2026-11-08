"use client";
import { useState, useEffect } from "react";
import uploadAvatar from "./uploadAvatar.js";
import { validateAvatarFile } from "./avatarValidation.js";
import { createClient } from "../utils/supabase/client.js";
import { styles } from "./contributeStyles.js";

// The profile editor: lets a signed-in contributor set their public display
// name and profile picture. Runs in the browser so it can preview the chosen
// picture and talk to Supabase; the account it writes proves who it is.
//
// Only the owner's own row is ever touched. An UPDATE touches an existing row,
// and an INSERT creates one only when no row exists yet. RLS policies let a user write
// exactly the row whose id is their own session user id — nothing else.
export default function ProfileForm({
  userId,
  initialDisplayName = "",
  initialAvatarUrl = null,
  initialAvatarPath = null,
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // The currently saved avatar — the initial value from the server, replaced
  // with the new public URL after a successful save.
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatarUrl);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // Release the object URL we created for the preview once we move on, so the
  // browser does not hold a blob alive indefinitely.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const onNameChange = (event) => {
    setDisplayName(event.target.value);
    setSaved(false);
    setErrors((e) => ({ ...e, display_name: undefined }));
  };

  const onFileChange = (event) => {
    const newFile = event.target.files?.[0] || null;
    setFile(newFile);
    setSaved(false);
    setErrors((e) => ({ ...e, avatar: undefined }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(newFile ? URL.createObjectURL(newFile) : null);
  };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setSaved(false);
    setFormError("");

    const trimmed = displayName.trim();
    const found = {};
    if (trimmed.length > 80) {
      found.display_name =
        "Keep the name to 80 characters or fewer. / សូមរក្សាឈ្មោះក្នុងដែនកំណត់ 80 តួអក្សរ។";
    }
    if (file) {
      const imageError = validateAvatarFile(file);
      if (imageError) found.avatar = imageError;
    }
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError(
        "Please fix the highlighted fields and try again. / សូមកែតម្រង់វាលដែលបានបន្លិច ហើយព្យាយាមម្តងទៀត។"
      );
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const supabase = createClient();

      // Upload first so avatar_path is settled before we touch profiles.
      let avatarPath = initialAvatarPath;
      let avatarUrl = initialAvatarUrl;
      if (file) {
        const uploaded = await uploadAvatar(file);
        avatarPath = uploaded.path;
        avatarUrl = uploaded.url;
      }

      // display_name is optional: an empty name is stored as null and the cards
      // then show "Anonymous contributor". All user names live in profiles only.
      //
      // Save WITHOUT upsert on conflict: the profiles table grants UPDATE only on
      // the columns display_name and avatar_path (deliberately not on id), and
      // Postgres refuses column-level privileges for INSERT ... ON CONFLICT DO
      // UPDATE (it needs table-level UPDATE). A plain UPDATE honours column
      // grants, so we update the owner's row and INSERT a fresh one only when no
      // row matched (a legacy account with no profile yet).
      const profileRow = { display_name: trimmed || null, avatar_path: avatarPath };
      // .select() asks Postgres for the rows the UPDATE actually changed (UPDATE
      // ... RETURNING). Without it the request goes out with return=minimal and
      // data comes back null even when the row was saved, which makes the
      // "no row yet" branch below wrongly try to INSERT and collide with the
      // primary key on every re-edit.
      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update(profileRow)
        .eq("id", userId)
        .select();

      if (updateError) throw updateError;

      if (!updated || updated.length === 0) {
        // No profile row yet — create it, owned by this session user.
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: userId, ...profileRow });
        if (insertError) throw insertError;
      }

      // Reflect the freshly saved state and drop the pending file/preview.
      setCurrentAvatarUrl(avatarUrl);
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSaved(true);
    } catch (caught) {
      console.error(
        "[profile] save failed:",
        caught?.code,
        caught?.message,
        caught?.details,
        caught?.hint
      );
      if (caught && typeof caught === "object" && caught.message === undefined) {
        console.error("[profile] save failed (full):", JSON.stringify(caught));
      }
      setFormError(
        "Your profile could not be saved. Please try again. / ប្រវត្តិរូបរបស់អ្នកមិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setBusy(false);
    }
  }

  // The preview circle: a just-picked file wins, otherwise the saved picture,
  // otherwise the default note avatar.
  const shownAvatar = previewUrl || currentAvatarUrl;
  const fallbackChar = displayName.trim()
    ? Array.from(displayName.trim())[0].toLocaleUpperCase()
    : "♪";

  return (
    <div style={styles.form}>
      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="display-name" style={styles.label}>
            Public display name / ឈ្មោះសាធារណៈ
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={onNameChange}
            maxLength={80}
            autoComplete="off"
            style={
              errors.display_name
                ? { ...styles.control, ...styles.invalid }
                : styles.control
            }
          />
          {errors.display_name ? (
            <p style={styles.error} role="alert">{errors.display_name}</p>
          ) : (
            <p style={styles.hint}>
              Shown beside your entries across the archive. Leave blank to stay
              anonymous. / នឹងបង្ហាញនៅជាប់នឹងបទចម្រៀងរបស់អ្នកនៅក្នុងបណ្ណសារ។ ទុកឱ្យទទេដើម្បីមិនបញ្ចេញឈ្មោះ។
            </p>
          )}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          Profile picture / រូបថតប្រវត្តិរូប
        </label>
        <div style={previewRow}>
          <span style={previewWrap}>
            {shownAvatar ? (
              <img src={shownAvatar} alt="Profile picture preview" style={previewImg} />
            ) : (
              <span style={previewFallback} aria-hidden="true">{fallbackChar}</span>
            )}
          </span>
          <label style={fileLabel}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <span style={fileButton}>Choose / ជ្រើសរើស</span>
          </label>
        </div>
        {errors.avatar ? (
          <p style={styles.error} role="alert">{errors.avatar}</p>
        ) : (
          <p style={styles.hint}>
            JPG, PNG or WebP, up to 2 MB. / JPG, PNG ឬ WebP ដែលមានទំហំមិនលើសពី 2 MB។
          </p>
        )}
      </div>

      {formError ? (
        <p style={styles.formError} role="alert">{formError}</p>
      ) : null}
      {saved ? (
        <p style={savedMsg} role="status">
          Your profile has been saved. / ប្រវត្តិរូបរបស់អ្នកត្រូវបានរក្សាទុក។
        </p>
      ) : null}

      <button
        type="submit"
        onClick={submit}
        disabled={busy}
        style={busy ? { ...styles.button, ...styles.buttonBusy } : styles.button}
      >
        {busy ? "Saving… / កំពុងរក្សាទុក…" : "Save profile / រក្សាទុកប្រវត្តិរូប"}
      </button>
    </div>
  );
}

const previewRow = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 8,
};

const previewWrap = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  overflow: "hidden",
  flexShrink: 0,
  border: "2px solid #CFBFA1",
  backgroundColor: "#FFFDF2",
};

const previewImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const previewFallback = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 34,
  color: "#A65A3C",
  backgroundColor: "#F1E6CF",
};

const fileLabel = { cursor: "pointer" };

const fileButton = {
  display: "inline-block",
  padding: "9px 16px",
  fontSize: 14,
  color: "#A65A3C",
  border: "1px solid #A65A3C",
  borderRadius: 8,
  fontFamily: "'Kantumruy Pro', Georgia, serif",
};

const savedMsg = {
  margin: "4px 0 18px",
  padding: "12px 14px",
  fontSize: 14,
  color: "#2E5B3A",
  backgroundColor: "#E4F0E0",
  border: "1px solid #B7D3AC",
  borderRadius: 8,
  lineHeight: 1.5,
};
