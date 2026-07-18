import type { MetadataRoute } from "next";

// Manifest PWA — Next automatycznie linkuje go w <head> jako /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finly — Twój portfel",
    short_name: "Finly",
    description:
      "Prosta aplikacja do organizowania własnych finansów: dochody, wydatki, cele i aktywa.",
    lang: "pl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#cdeadb",
    theme_color: "#10b981",
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
  };
}
