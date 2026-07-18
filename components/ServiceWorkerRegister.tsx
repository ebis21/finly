"use client";

import { useEffect } from "react";

// Rejestruje service workera tylko na produkcji (żeby nie kolidował z HMR
// podczas `next dev`). Cichy błąd, jeśli przeglądarka nie wspiera.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
