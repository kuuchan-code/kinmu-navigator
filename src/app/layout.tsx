import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "勤務ナビゲーター",
  description: "勤務時間とタスクを管理するためのシンプルなWebアプリケーション",
  keywords: ["勤務時間", "タスク管理", "勤怠管理", "タイムトラッキング"],
  authors: [{ name: "kuuchan-code" }],
  openGraph: {
    title: "勤務ナビゲーター",
    description: "勤務時間とタスクを管理するためのシンプルなWebアプリケーション",
    type: "website",
    url: "https://kinmu-navigator.pages.dev/",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
