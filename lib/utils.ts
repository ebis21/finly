import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPLN(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Dzisiejsza data jako ISO (RRRR-MM-DD) w lokalnej strefie.
export function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type Period = "month" | "year" | "all";

// Czy data (ISO) mieści się w wybranym okresie względem dziś.
export function matchesPeriod(iso: string, period: Period) {
  if (period === "all") return true;
  const today = todayISO();
  if (period === "year") return iso.slice(0, 4) === today.slice(0, 4);
  return iso.slice(0, 7) === today.slice(0, 7); // "month"
}
