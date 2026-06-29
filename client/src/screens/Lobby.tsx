import { useEffect, useState } from "react";
import { emit, socket } from "../socket";
import type { PackSummary, RoomState } from "../types";
import { AvatarCircle } from "../components/AvatarCircle";
import { WordpackManager } from "../components/WordpackManager";

interface Props {
  room: RoomState;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
  onLeave: () => void;
}

export function Lobby({ room, isHost, onAction, onLeave }: Props) {
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    emit<PackSummary[]>("wordpacks:list").then(setPacks);
    const onChanged = (list: PackSummary[]) => setPacks(list);
    // wordpacks:changed is broadcast by the server on edits.
    socket.on("wordpacks:changed", onChanged);
    return () => {
      socket.off("wordpacks:changed", onChanged);
    };
  }, []);

  const cfg = room.config;
  const maxImpostors = Math.max(1, room.players.length - 2);
  const selectedIds = cfg.wordpackIds || [];
  const totalPairs = packs
    .filter((p) => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.count, 0);

  // Group packs by their theme for display.
  const groups = packs.reduce<Record<string, PackSummary[]>>((acc, p) => {
    const key = p.theme || "Autres";
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  function update(patch: Partial<typeof cfg>) {
    onAction("lobby:updateConfig", { ...cfg, ...patch });
  }

  function togglePack(id: string) {
    const set = new Set(selectedIds);
    set.has(id) ? set.delete(id) : set.add(id);
    update({ wordpackIds: [...set] });
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <button className="text-sm text-aubergine-300 hover:text-white" onClick={onLeave}>
          ← Quitter
        </button>
        <div className="text-center">
          <div className="text-xs uppercase text-white/50">Code de la partie</div>
          <button
            onClick={() => navigator.clipboard?.writeText(room.code)}
            title="Copier le code"
            className="neon-title text-5xl font-extrabold tracking-[0.3em] transition active:scale-95"
          >
            {room.code}
          </button>
          <div className="text-[10px] text-white/40">cliquer pour copier</div>
        </div>
        <div className="w-16" />
      </div>

      <div className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">
          Joueurs ({room.players.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {room.players.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
              <AvatarCircle avatarId={p.avatar} size={40} />
              <div className="truncate">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  {p.pseudo} {p.isHost && <span title="Hôte">👑</span>}
                </div>
                {!p.connected && (
                  <div className="text-[10px] text-amber-300">déconnecté</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <div className="card p-4">
          <h2 className="mb-4 font-bold">Réglages</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-white/60">
              Nombre d'imposteurs : {cfg.numImpostors}
            </label>
            <input
              type="range"
              min={1}
              max={maxImpostors}
              value={Math.min(cfg.numImpostors, maxImpostors)}
              onChange={(e) => update({ numImpostors: parseInt(e.target.value, 10) })}
              className="w-full accent-aubergine-400"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-white/60">Mister White</span>
            <button
              onClick={() => update({ misterWhiteEnabled: !cfg.misterWhiteEnabled })}
              className={`relative h-7 w-12 rounded-full transition ${
                cfg.misterWhiteEnabled ? "bg-aubergine-400" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  cfg.misterWhiteEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-white/60">
              Mots par joueur avant le vote : {cfg.cluesPerPlayer}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={cfg.cluesPerPlayer}
              onChange={(e) =>
                update({ cluesPerPlayer: parseInt(e.target.value, 10) || 2 })
              }
              className="w-full accent-aubergine-400"
            />
            <div className="mt-1 text-xs text-white/40">
              Le vote démarre automatiquement quand chacun a posé ses {cfg.cluesPerPlayer} mots.
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-white/60">
                Packs de mots{" "}
                <span className="text-white/40">
                  ({selectedIds.length} sélectionné(s), {totalPairs} paires)
                </span>
              </label>
              <button
                className="btn-ghost shrink-0 px-3 py-1.5 text-sm"
                onClick={() => setShowManager(true)}
              >
                Gérer
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {Object.entries(groups).map(([theme, list]) => (
                <div key={theme}>
                  <div className="mb-1 text-xs uppercase tracking-wide text-aubergine-300">
                    {theme}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((p) => {
                      const on = selectedIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePack(p.id)}
                          className="rounded-full px-3 py-1.5 text-sm font-semibold text-white transition active:scale-95"
                          style={{
                            background: on
                              ? "linear-gradient(120deg,#ff2e9a,#8b5cd6)"
                              : "rgba(255,255,255,0.06)",
                            border: on
                              ? "1px solid rgba(255,255,255,0.3)"
                              : "1px solid rgba(255,255,255,0.14)",
                            boxShadow: on
                              ? "0 0 14px -3px rgba(255,46,154,0.8)"
                              : undefined,
                          }}
                        >
                          {on ? "✓ " : ""}
                          {p.name}{" "}
                          <span className="opacity-60">({p.count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full text-lg"
            disabled={room.players.length < 3 || totalPairs === 0}
            onClick={() => onAction("game:start")}
          >
            {room.players.length < 3
              ? "Il faut au moins 3 joueurs"
              : totalPairs === 0
                ? "Sélectionnez au moins un pack"
                : "Démarrer la partie"}
          </button>
        </div>
      ) : (
        <div className="card p-6 text-center text-white/60">
          En attente du lancement par l'hôte…
        </div>
      )}

      {showManager && (
        <WordpackManager
          onClose={() => setShowManager(false)}
          onChanged={setPacks}
        />
      )}
    </div>
  );
}
