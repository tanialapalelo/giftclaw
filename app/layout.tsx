import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://giftclaw.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "GiftClaw — Find the Perfect Gift",
    template: "%s | GiftClaw",
  },
  description:
    "Tell us about your friend, get 8 AI-personalized gift ideas, then share a retro claw machine link — they play to reveal their gift. No login required.",
  keywords: [
    "gift finder",
    "AI gift ideas",
    "personalized gifts",
    "claw machine game",
    "gift suggestions",
    "secret gift",
  ],
  authors: [{ name: "GiftClaw" }],
  creator: "GiftClaw",
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "GiftClaw",
    title: "GiftClaw — Find the Perfect Gift",
    description:
      "AI gift suggestions wrapped in a retro arcade claw machine. Share the link, let them play.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GiftClaw — AI-powered gift finder with a claw machine game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftClaw — Find the Perfect Gift",
    description:
      "AI gift suggestions wrapped in a retro arcade claw machine. Share the link, let them play.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
