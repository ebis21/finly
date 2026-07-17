"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Studs } from "@/components/Studs";
import { useFinly } from "@/lib/store";
import { formatDate, formatPLN } from "@/lib/utils";

const ASSET_TYPES = ["Gotówka", "Oszczędności", "Sprzęt", "Inwestycje", "Inne"];

const TYPE_EMOJI: Record<string, string> = {
  Gotówka: "💵",
  Oszczędności: "🏦",
  Sprzęt: "🚲",
  Inwestycje: "📈",
  Inne: "📦",
};

export default function AssetsPage() {
  const { assets, addAsset, removeAsset, updateAssetValue } = useFinly();
  const [addingOpen, setAddingOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState(ASSET_TYPES[0]);
  const [value, setValue] = useState("");

  const selected = assets.find((a) => a.id === selectedId);
  const parsedValue = parseFloat(value.replace(",", "."));
  const total = assets.reduce((acc, a) => acc + a.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold">Aktywa</h1>

      <section className="rounded-3xl border-2 border-ink bg-sun p-5 text-ink shadow-brick-lg">
        <Studs className="text-ink/20" />
        <p className="mt-4 text-sm font-bold text-ink/60">Mój majątek</p>
        <p className="font-display text-5xl font-bold tracking-tight">
          {formatPLN(total)}
        </p>
      </section>

      {assets.length === 0 && (
        <div className="brick p-8 text-center">
          <p className="text-sm font-semibold text-ink/50">
            Nie masz jeszcze żadnych aktywów. Dodaj pierwsze poniżej.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {assets.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(a.id);
                setValue(String(a.value));
              }}
              className="brick brick-press flex w-full items-center gap-3 p-3 text-left hover:bg-paper"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-sun/40 text-lg">
                {TYPE_EMOJI[a.type] ?? "📦"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{a.name}</span>
                <span className="block text-xs font-semibold text-ink/40">
                  {a.type} · aktualizacja {formatDate(a.updatedAt)}
                </span>
              </span>
              <span className="font-display text-sm font-bold">
                {formatPLN(a.value)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          setAddingOpen(true);
          setName("");
          setType(ASSET_TYPES[0]);
          setValue("");
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/40 py-4 font-display text-sm font-bold text-ink/50 transition-colors hover:border-ink hover:text-ink"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
        Nowe aktywo
      </button>

      {addingOpen && (
        <Modal title="Nowe aktywo" onClose={() => setAddingOpen(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="asset-name">
                Nazwa
              </label>
              <input
                id="asset-name"
                className="input"
                placeholder="Np. gotówka, konto, rower…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="asset-type">
                Typ
              </label>
              <select
                id="asset-type"
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_EMOJI[t]} {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="asset-value">
                Wartość (zł)
              </label>
              <input
                id="asset-value"
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={!(name.trim() && parsedValue >= 0)}
              onClick={() => {
                addAsset({ name: name.trim(), type, value: parsedValue });
                setAddingOpen(false);
              }}
            >
              Dodaj aktywo
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal
          title={`${TYPE_EMOJI[selected.type] ?? "📦"} ${selected.name}`}
          onClose={() => setSelectedId(null)}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center">
              <p className="font-display text-3xl font-bold tracking-tight">
                {formatPLN(selected.value)}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink/40">
                {selected.type} · aktualizacja {formatDate(selected.updatedAt)}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="asset-new-value">
                Nowa wartość (zł)
              </label>
              <div className="flex gap-2">
                <input
                  id="asset-new-value"
                  className="input"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary w-auto shrink-0 px-5"
                  disabled={!(parsedValue >= 0)}
                  onClick={() => {
                    updateAssetValue(selected.id, parsedValue);
                    setSelectedId(null);
                  }}
                >
                  Zapisz
                </button>
              </div>
            </div>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                removeAsset(selected.id);
                setSelectedId(null);
              }}
            >
              Usuń aktywo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
