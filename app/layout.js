import collection from "../collection.config.js";
import "./globals.css";

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

// Aged-paper cream is the foundation of the whole vintage look.
const paper = "#F5F3C7";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
        {children}
      </body>
    </html>
  );
}
