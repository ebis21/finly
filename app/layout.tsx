import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finly — Twój portfel",
  description:
    "Prosta aplikacja do organizowania własnych finansów: dochody, wydatki, cele i aktywa w jednym miejscu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className="bg-slate-200 font-sans text-slate-900 antialiased">
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-lg">
          <Header />
          <main className="flex-1 px-4 pb-28 pt-2">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
