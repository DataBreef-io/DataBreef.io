import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Outfit,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DataBreef — Your schema, surfaced.",
    template: "%s | DataBreef",
  },
  description:
    "DataBreef surfaces intelligence from your PostgreSQL schema. Read-only, secure, and beautifully simple.",
  keywords: ["database", "schema", "postgresql", "intelligence", "analytics"],
  authors: [{ name: "DataBreef" }],
  creator: "DataBreef",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "DataBreef",
    title: "DataBreef — Your schema, surfaced.",
    description:
      "DataBreef surfaces intelligence from your PostgreSQL schema. Read-only, secure, and beautifully simple.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
