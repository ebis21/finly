"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Target, Users, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useFinly } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { label: "Pulpit", href: "/", icon: LayoutDashboard },
  { label: "Cele", href: "/cele", icon: Target },
  { label: "Aktywa", href: "/aktywa", icon: Wallet },
  { label: "Dzieci", href: "/dzieci", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setAddOpen } = useFinly();
  const { user } = useAuth();

  // Konto dziecka nie widzi zakładki „Dzieci”. Rodzic i stare konta/gość — widzą.
  const navItems = items.filter(
    (item) => item.href !== "/dzieci" || user?.role !== "child"
  );
  const half = Math.ceil(navItems.length / 2);
  const left = navItems.slice(0, half);
  const right = navItems.slice(half);

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-x-2 border-t-2 border-ink bg-white">
      <div
        className={cn(
          "grid items-center px-2 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
          navItems.length >= 4 ? "grid-cols-5" : "grid-cols-4"
        )}
      >
        {left.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Dodaj transakcję"
            onClick={() => setAddOpen(true)}
            className="brick-press -mt-7 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-brand text-white shadow-brick transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-7 w-7" strokeWidth={3} />
          </button>
        </div>
        {right.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  label,
  href,
  icon: Icon,
  active,
}: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 py-1 text-xs font-bold"
    >
      <span
        className={cn(
          "rounded-xl border-2 px-2.5 py-1 transition-colors",
          active
            ? "border-ink bg-brand-light text-ink"
            : "border-transparent text-ink/40"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className={active ? "text-ink" : "text-ink/40"}>{label}</span>
    </Link>
  );
}
