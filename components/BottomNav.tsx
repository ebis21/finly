import { LayoutDashboard, Plus, Target, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Pulpit", icon: LayoutDashboard, active: true },
  { label: "Cele", icon: Target, active: false },
  { label: "Aktywa", icon: Wallet, active: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white">
      <div className="grid grid-cols-4 items-center px-2 pb-2 pt-1">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Dodaj"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/40 transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>
        <NavItem {...items[2]} />
      </div>
    </nav>
  );
}

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-0.5 py-1 text-xs font-medium",
        active ? "text-brand-dark" : "text-slate-400"
      )}
    >
      <Icon className="h-6 w-6" />
      {label}
    </button>
  );
}
