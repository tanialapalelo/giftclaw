import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
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

export const metadata: Metadata = {
    title: "GiftClaw — Find the Perfect Gift",
    description: "AI-powered gift suggestions with a pixel art claw machine game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${pixelFont.variable} ${bodyFont.variable}`}>
        <body className="antialiased">{children}</body>
      </html>
  );
}
