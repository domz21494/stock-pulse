import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StockPulse — Real-time markets",
  description: "Live stock charts, price alerts and AI insights.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-border py-4 text-center text-xs text-muted">
          StockPulse · Data for demo purposes, not financial advice.
        </footer>
      </body>
    </html>
  );
}
