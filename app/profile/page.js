import { createClient } from "../../utils/supabase/server.js";
import ProfileForm from "../../components/ProfileForm.js";
import { styles } from "../../components/contributeStyles.js";

// The contributor profile editor. A Server Component, so the signed-in check runs
// before any form HTML is produced — the same gate /contribute uses.
//
// Only the visitor's own profile is ever read here (filtered by their session
// user id), and only the public profile columns leave the database. RLS
// separately decides who may write; this page just hands the session user id
// down to the form.
export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <p style={styles.kicker}>PROFILE</p>
          <h1 style={styles.title}>Log in to edit your profile</h1>
          <p style={styles.sub}>
            Your profile is tied to the account you sign in with, so logging in
            is what shows you this page.
          </p>
          <div style={styles.form}>
            <p style={styles.hint}>
              Already have an account?{" "}
              <a href="/login" style={styles.backInline}>Log in</a>
              {" · "}
              <a href="/signup" style={styles.backInline}>Create one</a>
              .
            </p>
            <a href="/" style={styles.buttonLink}>Back to the archive</a>
          </div>
        </div>
      </main>
    );
  }

  // Own profile only. Public-to-public: display_name and avatar_path are listed
  // by name; no email and no auth metadata are ever requested.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  // The stored avatar_path is turned into a public URL with getPublicUrl so the
  // form can preview the current picture; nothing storage-level reaches the page.
  const { data: publicUrl } = profile?.avatar_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_path)
    : { data: null };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <p style={styles.kicker}>PROFILE</p>
        <h1 style={styles.title}>Your profile</h1>
        <p style={styles.sub}>
          This is the name and picture shown beside your entries across the
          archive.
        </p>

        <ProfileForm
          userId={user.id}
          initialDisplayName={profile?.display_name || ""}
          initialAvatarUrl={publicUrl?.publicUrl || null}
          initialAvatarPath={profile?.avatar_path || null}
        />

        <p style={styles.hint}>
          <a href="/" style={styles.backInline}>Back to the archive</a>
        </p>
      </div>
    </main>
  );
}
