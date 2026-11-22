"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "./LanguageProvider.js";

export default function HeaderNavigation({ signedIn, isReviewer }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const links = signedIn
    ? [["/", "Home"], ["/my-archive", "My archive"], ["/my-entries", "My entries"], ["/profile", "Profile"]]
    : [["/", "Home"], ["/#archive-search", "Collection"]];
  if (isReviewer) links.push(["/review", "Review"]);

  return (
    <nav className="header-navigation" aria-label={t("Main navigation")}>
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="header-nav-link"
          aria-current={pathname === href ? "page" : undefined}>
          {t(label)}
        </Link>
      ))}
    </nav>
  );
}
