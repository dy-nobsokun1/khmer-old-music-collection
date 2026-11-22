"use client";
import Link from "next/link";
import { useTranslation } from "./LanguageProvider.js";

export default function ProfileMenuContent({ email, signedIn, accounts, forget, close, signOut }) {
  const { t } = useTranslation();
  return (
    <>
      <p className="profile-menu-heading">{t("Accounts")}</p>
      <p className="profile-menu-hint">{t("Choose a saved account to sign in.")}</p>
      {accounts.length ? (
        <ul className="saved-account-list">
          {accounts.map((account) => {
            const current = signedIn && account.toLowerCase() === email?.toLowerCase();
            return (
              <li key={account} className="saved-account-row">
                <Link className="saved-account-link" onClick={close}
                  href={current ? "/profile" : `/login?email=${encodeURIComponent(account)}`}
                  aria-current={current ? "true" : undefined}>
                  <span className="saved-account-avatar" aria-hidden="true">{Array.from(account)[0].toUpperCase()}</span>
                  <span className="saved-account-details">
                    <span className="saved-account-email">{account}</span>
                    <span className="saved-account-status">{t(current ? "Current account" : "Sign in to switch")}</span>
                  </span>
                  {current ? <span className="saved-account-check" aria-hidden="true">✓</span> : null}
                </Link>
                {!current ? (
                  <button type="button" className="forget-account" onClick={() => forget(account)}
                    aria-label={t("Forget {email}", { email: account })} title={t("Forget account")}>×</button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : <p className="profile-menu-empty">{t("No saved accounts yet.")}</p>}
      <div className="profile-menu-footer">
        <Link href="/login" className="profile-menu-action" onClick={close}>
          <span aria-hidden="true">＋</span> {t("Add another account")}
        </Link>
        {signedIn ? (
          <>
            <Link href="/profile" className="profile-menu-action" onClick={close}>{t("Your profile")}</Link>
            <form action={signOut}>
              <button type="submit" className="profile-menu-action profile-logout">{t("Log out")}</button>
            </form>
          </>
        ) : null}
      </div>
    </>
  );
}
