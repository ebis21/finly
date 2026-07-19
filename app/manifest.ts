import type { MetadataRoute } from "next";

// Manifest PWA — Next automatycznie linkuje go w <head> jako /manifest.webmanifest.
// Wersja gotowa pod pakowanie do sklepów (PWABuilder / Bubblewrap / Play / App Store).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Finly — Twój portfel",
    short_name: "Finly",
    description:
      "Prosta aplikacja do organizowania własnych finansów: dochody, wydatki, cele i aktywa.",
    lang: "pl",
    dir: "ltr",
    categories: ["finance", "productivity", "lifestyle"],
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2faf5",
    theme_color: "#f2faf5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dodaj transakcję",
        short_name: "Dodaj",
        description: "Szybko dopisz dochód lub wydatek",
        url: "/?dodaj=1",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Cele",
        short_name: "Cele",
        url: "/cele",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Aktywa",
        short_name: "Aktywa",
        url: "/aktywa",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
