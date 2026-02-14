import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Check-in",
    template: "%s | Smart Check-in",
  },
  description:
    "無人宿泊施設向けセルフチェックインシステム。生体認証とSecret Codeで安全・スムーズなチェックインを実現。",
  keywords: ["チェックイン", "WebAuthn", "生体認証", "無人宿泊", "セルフチェックイン"],
  openGraph: {
    title: "Smart Check-in",
    description: "生体認証によるセルフチェックインシステム",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
