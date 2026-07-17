"use client";

import Image from "next/image";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="flex items-center gap-2.5 px-4 py-4">
      <Image
        src="/logo.png"
        alt="Logo Finly — zielony klocek z monetą"
        width={40}
        height={40}
        priority
        className="h-10 w-10 rounded-xl border-2 border-ink object-cover shadow-brick-sm"
      />
      <span className="font-display text-2xl font-bold">Finly</span>

      <button
        type="button"
        aria-label="Twoje konto"
        onClick={() => setAccountOpen(true)}
        className="brick-press ml-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-brick-sm hover:bg-paper"
      >
        <UserRound className="h-5 w-5" />
      </button>

      {accountOpen && (
        <Modal title="Twoje konto" onClose={() => setAccountOpen(false)}>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center">
              <p className="text-3xl">🧱</p>
              <p className="mt-1 font-display font-bold">
                {user ? user.name : "Grasz lokalnie"}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink/50">
                Wszystkie dane są zapisane tylko na tym urządzeniu.
              </p>
            </div>
            <button type="button" className="btn-primary" disabled>
              Zaloguj się (wkrótce)
            </button>
            <p className="text-center text-xs font-semibold text-ink/40">
              Konta i synchronizacja w chmurze pojawią się w kolejnym etapie —
              aplikacja jest już na to gotowa.
            </p>
          </div>
        </Modal>
      )}
    </header>
  );
}
