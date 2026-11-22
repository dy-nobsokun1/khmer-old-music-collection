import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server.js";
import HeaderNavigation from "./HeaderNavigation.js";
import HeaderAccount from "./HeaderAccount.js";
import LanguageToggle from "./LanguageToggle.js";
import ProfileMenu from "./ProfileMenu.js";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isReviewer = false;
  if (user) {
    const { data, error } = await supabase.rpc("is_reviewer");
    isReviewer = !error && data === true;
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <HeaderNavigation signedIn={Boolean(user)} isReviewer={isReviewer} />
        <div className="header-actions">
          <div className="header-user-controls">
            <ProfileMenu email={user?.email} signedIn={Boolean(user)} signOut={signOut} />
            <LanguageToggle />
          </div>
          <HeaderAccount signedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
