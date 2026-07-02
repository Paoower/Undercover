import { useEffect, useRef, useState } from "react";
import { emit } from "../socket";
import type { PackSummary, WordPack, WordPair } from "../types";
import { getUserId, setUserId } from "../user";

interface Props {
  onClose: () => void;
  onChanged: (packs: PackSummary[]) => void;
}

export function WordpackManager({ onClose, onChanged }: Props) {
  const [userId, setUid] = useState(getUserId());
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [editing, setEditing] = useState<WordPack | null>(null);
  const [bulk, setBulk] = useState("");
  const [civil, setCivil] = useState("");
  const [imposteur, setImposteur] = useState("");
  const [idInput, setIdInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh(uid = userId) {
    const list = await emit<PackSummary[]>("wordpacks:list", { userId: uid });
    setPacks(list);
    onChanged(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  const owned = packs.filter((p) => p.owned);
  const shared = packs.filter((p) => p.shared);
  const editingOwned = !!editing && editing.ownerId === userId;

  async function openPack(id: string) {
    const pack = await emit<WordPack | null>("wordpacks:get", id);
    if (pack) setEditing(pack);
  }

  function newPack() {
    setEditing({ id: "", name: "Nouveau pack", theme: "", pairs: [], ownerId: userId });
  }

  async function save() {
    if (!editing) return;
    await emit("wordpacks:save", { ...editing, userId });
    await refresh();
    setEditing(null);
  }

  async function removePack(id: string) {
    if (!confirm("Supprimer ce pack ?")) return;
    await emit("wordpacks:delete", { id, userId });
    if (editing?.id === id) setEditing(null);
    refresh();
  }

  function restoreId() {
    const next = setUserId(idInput);
    setUid(next);
    setIdInput("");
    setEditing(null);
    refresh(next);
  }

  async function applyBulk() {
    if (!editing) return;
    const parsed = await emit<WordPair[]>("wordpacks:parseBulk", bulk);
    setEditing({ ...editing, pairs: [...editing.pairs, ...parsed] });
    setBulk("");
  }

  function addManual() {
    if (!editing || !civil.trim() || !imposteur.trim()) return;
    setEditing({
      ...editing,
      pairs: [...editing.pairs, { civil: civil.trim(), imposteur: imposteur.trim() }],
    });
    setCivil("");
    setImposteur("");
  }

  function removePair(i: number) {
    if (!editing) return;
    setEditing({ ...editing, pairs: editing.pairs.filter((_, idx) => idx !== i) });
  }

  function exportPack() {
    if (!editing) return;
    const blob = new Blob([JSON.stringify(editing, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editing.name || "pack"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importPack(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        setEditing({
          id: "",
          name: data.name || "Pack importé",
          theme: data.theme || "",
          pairs: Array.isArray(data.pairs) ? data.pairs : [],
          ownerId: userId,
        });
      } catch {
        alert("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function packRow(p: PackSummary) {
    return (
      <div
        key={p.id}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
          editing?.id === p.id ? "bg-aubergine-600" : "bg-white/5"
        }`}
      >
        <button className="flex-1 text-left" onClick={() => openPack(p.id)}>
          <div className="font-semibold">{p.name}</div>
          <div className="text-xs text-white/50">
            {p.count} paires {p.theme && `· ${p.theme}`}
          </div>
        </button>
        {p.owned && (
          <button
            className="text-red-300 hover:text-red-200"
            onClick={() => removePack(p.id)}
            title="Supprimer"
          >
            🗑
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-xl font-bold">Gestion des packs de mots</h2>
          <button className="btn-ghost px-3 py-1" onClick={onClose}>
            Fermer ✕
          </button>
        </div>

        {/* Each column scrolls on its own (md+); the grid itself stays fixed. */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-[240px_1fr] md:overflow-hidden">
          {/* Pack list */}
          <div className="flex min-h-0 flex-col gap-2 md:overflow-y-auto md:pr-1">
            <button className="btn-primary py-2 text-sm" onClick={newPack}>
              + Nouveau pack
            </button>
            <button
              className="btn-ghost py-2 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              ⬆ Importer JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importPack}
            />

            {/* Identity: reuse this id on another device to recover your packs */}
            <div className="mt-2 rounded-lg bg-black/30 p-2 text-xs">
              <div className="mb-1 text-white/50">Mon identifiant</div>
              <div className="flex items-center gap-1">
                <code className="flex-1 truncate text-aubergine-200">{userId}</code>
                <button
                  className="btn-ghost px-2 py-1"
                  title="Copier"
                  onClick={() => navigator.clipboard?.writeText(userId)}
                >
                  ⧉
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <input
                  className="input py-1 text-xs"
                  placeholder="Restaurer un ID…"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                />
                <button
                  className="btn-ghost shrink-0 px-2 py-1"
                  disabled={!idInput.trim()}
                  onClick={restoreId}
                >
                  OK
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1">
              <div className="text-xs uppercase tracking-wide text-aubergine-300">
                Mes packs
              </div>
              {owned.length === 0 && (
                <div className="px-1 py-2 text-xs text-white/40">
                  Aucun pack perso. Crée ou duplique un pack pour le sauvegarder.
                </div>
              )}
              {owned.map(packRow)}

              {shared.length > 0 && (
                <div className="mt-3 text-xs uppercase tracking-wide text-aubergine-300">
                  Packs partagés
                </div>
              )}
              {shared.map(packRow)}
            </div>
          </div>

          {/* Editor */}
          {editing ? (
            <div className="flex min-h-0 flex-col gap-3 md:overflow-y-auto md:pr-1">
              {!editingOwned && (
                <div className="rounded-lg bg-aubergine-600/40 px-3 py-2 text-xs text-white/80">
                  Pack partagé en lecture seule — « Enregistrer » en créera une copie
                  dans <strong>Mes packs</strong>.
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Nom du pack"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Thème (optionnel)"
                  value={editing.theme}
                  onChange={(e) => setEditing({ ...editing, theme: e.target.value })}
                />
              </div>

              {/* Bulk import */}
              <div>
                <div className="mb-1 text-xs text-white/60">
                  Import en masse — une paire par ligne :{" "}
                  <code>mot civil | mot imposteur</code> (ou virgule)
                </div>
                <textarea
                  className="input h-24 font-mono text-sm"
                  placeholder={"Tom et Jerry | Titi et Grosminet\nCoca | Pepsi"}
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                />
                <button className="btn-ghost mt-2 py-2 text-sm" onClick={applyBulk}>
                  Ajouter les paires
                </button>
              </div>

              {/* Manual add */}
              <div className="flex items-end gap-2">
                <input
                  className="input"
                  placeholder="Mot civil"
                  value={civil}
                  onChange={(e) => setCivil(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Mot imposteur"
                  value={imposteur}
                  onChange={(e) => setImposteur(e.target.value)}
                />
                <button className="btn-ghost shrink-0 py-3" onClick={addManual}>
                  +
                </button>
              </div>

              {/* Pairs list */}
              <div className="max-h-52 overflow-auto rounded-xl bg-black/30 p-2">
                {editing.pairs.length === 0 && (
                  <div className="p-4 text-center text-sm text-white/40">
                    Aucune paire pour l'instant
                  </div>
                )}
                {editing.pairs.map((pair, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 border-b border-white/5 px-2 py-1.5 text-sm"
                  >
                    <span className="flex-1 text-emerald-200">{pair.civil}</span>
                    <span className="text-white/30">↔</span>
                    <span className="flex-1 text-red-200">{pair.imposteur}</span>
                    <button
                      className="text-white/40 hover:text-red-300"
                      onClick={() => removePair(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={save}>
                  {editingOwned
                    ? `💾 Enregistrer (${editing.pairs.length} paires)`
                    : `💾 Copier dans mes packs (${editing.pairs.length} paires)`}
                </button>
                <button className="btn-ghost" onClick={exportPack}>
                  ⬇ Export JSON
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-white/40">
              Sélectionnez ou créez un pack à gauche
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
