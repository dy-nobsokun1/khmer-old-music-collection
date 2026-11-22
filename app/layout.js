import collection from "../collection.config.js";
import "./globals.css";
import LanguageProvider from "../components/LanguageProvider.js";
import SiteHeader from "../components/SiteHeader.js";
import { getLanguage } from "../utils/i18n/server.js";

export async function generateMetadata() {
  const language = await getLanguage();
  const identity = language === "km" ? collection.translations.km : collection;
  return {
    title: `${identity.name} — ${language === "km" ? "បណ្ណសាររស់ខ្មែរ" : "Khmer Living Archive"}`,
    description: identity.description,
  };
}

// Aged-paper cream is the foundation of the whole vintage look.
const paper = "#F5F3C7";

export default async function RootLayout({ children }) {
  const language = await getLanguage();
  return (
    <html lang={language}>
      <body
        style={{
          margin: 0,
          backgroundColor: paper,
          color: "#4A3B2A",
          fontFamily:
            "'Kantumruy Pro', Georgia, 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        <LanguageProvider initialLanguage={language}>
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
