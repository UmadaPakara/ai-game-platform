import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ClientLayout from "./components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameTube - AI Game Platform",
  description: "Play, create, and share AI-generated web games",
  openGraph: {
    title: "GameTube - AI Game Platform",
    description: "Play, create, and share AI-generated web games",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen font-sans`}
      >
        <LanguageProvider>
          <Suspense fallback={null}>
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
        </LanguageProvider>
      </body>
    </html>
  );
}
