import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { FinlyProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { AppEntry } from "@/components/AppEntry";

const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo",
});

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
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
    <html lang="pl" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="bg-mint font-sans text-ink antialiased">
        <AuthProvider>
          <AppEntry>
            <FinlyProvider>
              <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col border-x-2 border-ink bg-paper">
                <Header />
                <main className="flex-1 px-4 pb-28 pt-2">{children}</main>
                <BottomNav />
                <AddTransactionSheet />
              </div>
            </FinlyProvider>
          </AppEntry>
        </AuthProvider>
      </body>
    </html>
  );
}
