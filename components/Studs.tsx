import { cn } from "@/lib/utils";

/** Wypustki jak na klocku Lego — sygnatura dużych kafelków. */
export function Studs({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2", className)} aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full bg-current" />
      ))}
    </div>
  );
}
