import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PageCraft — Build & Publish Stunning Pages",
    template: "%s | PageCraft",
  },
  description:
    "The no-code SaaS page builder. Drag, drop, and publish landing pages, portfolios & websites in minutes — with zero code.",
  keywords: ["page builder", "no-code", "landing page", "portfolio", "website builder"],
  authors: [{ name: "PageCraft" }],
  openGraph: {
    type: "website",
    siteName: "PageCraft",
    title: "PageCraft — Build & Publish Stunning Pages",
    description: "Drag, drop, publish. Zero code required.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
