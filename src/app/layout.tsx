import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Optimized font
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/components/Providers";
import { PremiumEffects } from "@/components/layout/PremiumEffects";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* <PremiumEffects /> */}
        <Suspense fallback={null}>
          <AntdRegistry>
            <Providers>{children}</Providers>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
