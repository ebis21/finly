"use client";

import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-ink/50"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-b-0 border-ink bg-white p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            type="button"
            aria-label="Zamknij"
            onClick={onClose}
            className="brick-press rounded-full border-2 border-ink bg-white p-1 text-ink shadow-brick-sm hover:bg-paper"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
