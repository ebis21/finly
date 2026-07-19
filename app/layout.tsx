import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
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
  applicationName: "Finly",
  title: "Finly — Twój portfel",
  description:
    "Prosta aplikacja do organizowania własnych finansów: dochody, wydatki, cele i aktywa w jednym miejscu.",
  appleWebApp: {
    capable: true,
    title: "Finly",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  // Kolor paska stanu = tło aplikacji (paper), żeby na telefonie nie było
  // jaskrawozielonego paska nad nagłówkiem. `cover` pozwala nam samodzielnie
  // obsłużyć bezpieczne obszary (notch / pasek gestów) przez env(safe-area-*).
  themeColor: "#f2faf5",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-[100dvh] bg-paper font-sans text-ink antialiased">
        <ServiceWorkerRegister />
        <AuthProvider>
          <AppEntry>
            <FinlyProvider>
              <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col border-x-2 border-ink bg-paper">
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
