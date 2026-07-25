import type { Metadata } from "next";
import { Press_Start_2P, Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";

const arcadeFont = Press_Start_2P({
  weight: "400",
  variable: "--font-arcade",
  subsets: ["latin"],
  display: "swap",
});

const pixelSans = Pixelify_Sans({
  variable: "--font-pixel-sans",
  subsets: ["latin"],
  display: "swap",
});

const pixelMono = VT323({
  weight: "400",
  variable: "--font-pixel-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Semantix.io - Arcade Mode",
  description: "Real-time semantic word association arcade game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${arcadeFont.variable} ${pixelSans.variable} ${pixelMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">{children}</body>
    </html>
  );
}
