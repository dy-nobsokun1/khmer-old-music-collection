"use client";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "./LanguageProvider.js";
import useSavedAccounts from "./useSavedAccounts.js";
import ProfileMenuContent from "./ProfileMenuContent.js";

export default function ProfileMenu({ email, signedIn, signOut }) {
  const { t } = useTranslation();
  const { accounts, forget } = useSavedAccounts(email);
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const menuId = useId();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (!container.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="profile-menu" ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
      <button type="button" className="profile-trigger" ref={trigger}
        aria-label={t("Account options")} aria-expanded={open} aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div id={menuId} className="profile-menu-panel">
          <ProfileMenuContent email={email} signedIn={signedIn} accounts={accounts}
            forget={forget} close={() => setOpen(false)} signOut={signOut} />
        </div>
      ) : null}
    </div>
  );
}
