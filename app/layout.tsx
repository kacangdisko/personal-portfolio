import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

/* Self-hosted by next/font — no external request, no layout shift. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-stack",
  display: "swap",
});

const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui-stack",
  display: "swap",
});

/* Change this to your real domain once it is set up. */
const SITE_URL = "https://dzaky-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${profile.name} — ${profile.tagline}`,
  description: `${profile.tagline}`,
  keywords: [
    "machine learning",
    "computer science",
    "Bina Nusantara",
    "portfolio",
    "internship",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title: profile.name,
    description: `${profile.tagline}`,
    url: SITE_URL,
    siteName: `${profile.name} — Portfolio`,
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description: profile.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080a12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
