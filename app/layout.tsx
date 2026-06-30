import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { LangProvider } from "@/lib/i18n/context";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inter School",
  description: "Inter School — boshqaruv va ota-ona portali",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5B800",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`h-full ${barlowCondensed.variable} ${inter.variable}`}>
      <body className="min-h-full bg-[#F5F5F5] font-[family-name:var(--font-inter)]">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
