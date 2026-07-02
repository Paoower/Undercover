import { useEffect, useState } from "react";
import { emit, socket } from "../socket";
import type { PackSummary, RoomState } from "../types";
import { AvatarCircle } from "../components/AvatarCircle";
import { WordpackManager } from "../components/WordpackManager";
import { getUserId } from "../user";

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
    emit<PackSummary[]>("wordpacks:list", { userId: getUserId() }).then(setPacks);
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
    if (!isHost) return;
    onAction("lobby:updateConfig", { ...cfg, ...patch });
  }

  function togglePack(id: string) {
    if (!isHost) return;
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

      <div className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Réglages</h2>
          {!isHost && (
            <span className="text-xs text-white/40">
              Lecture seule — seul l'hôte peut modifier
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-white/60">
            Nombre d'imposteurs : {cfg.numImpostors}
          </label>
          <input
            type="range"
            min={1}
            max={maxImpostors}
            value={Math.min(cfg.numImpostors, maxImpostors)}
            disabled={!isHost}
            onChange={(e) => update({ numImpostors: parseInt(e.target.value, 10) })}
            className="w-full accent-aubergine-400 disabled:opacity-50"
          />
        </div>

        <Toggle
          label="Mister White"
          on={cfg.misterWhiteEnabled}
          disabled={!isHost}
          onToggle={() => update({ misterWhiteEnabled: !cfg.misterWhiteEnabled })}
        />

        <div className="mb-4">
          <label className="mb-1 block text-sm text-white/60">
            Mots par joueur avant le vote : {cfg.cluesPerPlayer}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={cfg.cluesPerPlayer}
            disabled={!isHost}
            onChange={(e) => update({ cluesPerPlayer: parseInt(e.target.value, 10) || 2 })}
            className="w-full accent-aubergine-400 disabled:opacity-50"
          />
          <div className="mt-1 text-xs text-white/40">
            Le vote démarre automatiquement quand chacun a posé ses {cfg.cluesPerPlayer} mots.
          </div>
        </div>

        <SecondsField
          label="Temps par tour (en secondes)"
          hint="0 = illimité. À l'expiration, le tour est passé automatiquement."
          value={cfg.turnSeconds}
          disabled={!isHost}
          onChange={(v) => update({ turnSeconds: v })}
        />

        <SecondsField
          label="Temps de vote (en secondes)"
          hint="0 = illimité. Les votes non confirmés comptent comme abstention."
          value={cfg.voteSeconds}
          disabled={!isHost}
          onChange={(v) => update({ voteSeconds: v })}
        />

        <Toggle
          label="Afficher les rôles dès le début"
          hint="Si désactivé, chacun ne voit que son mot ; civil/imposteur n'est révélé qu'à la fin."
          on={!cfg.hideRolesUntilEnd}
          disabled={!isHost}
          onToggle={() => update({ hideRolesUntilEnd: !cfg.hideRolesUntilEnd })}
        />

        <Toggle
          label="Afficher le nombre de votes"
          hint="À la fin de la manche, montre les votes reçus par chaque joueur."
          on={cfg.showVoteCounts}
          disabled={!isHost}
          onToggle={() => update({ showVoteCounts: !cfg.showVoteCounts })}
        />

        <Toggle
          label="La partie continue jusqu'à la victoire"
          hint="Si désactivé, la partie s'arrête après le 1er vote. En mode continu, les manches suivantes n'ont qu'1 mot par joueur."
          on={cfg.continueGame}
          disabled={!isHost}
          onToggle={() => update({ continueGame: !cfg.continueGame })}
        />

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-white/60">
              Packs de mots{" "}
              <span className="text-white/40">
                ({selectedIds.length} sélectionné(s), {totalPairs} paires)
              </span>
            </label>
            {isHost && (
              <button
                className="btn-ghost shrink-0 px-3 py-1.5 text-sm"
                onClick={() => setShowManager(true)}
              >
                Gérer
              </button>
            )}
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
                        disabled={!isHost}
                        onClick={() => togglePack(p.id)}
                        className="rounded-full px-3 py-1.5 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-default disabled:active:scale-100"
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
                          opacity: !isHost && !on ? 0.5 : 1,
                        }}
                      >
                        {on ? "✓ " : ""}
                        {p.name} <span className="opacity-60">({p.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
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
        ) : (
          <div className="rounded-xl bg-white/5 p-3 text-center text-white/60">
            En attente du lancement par l'hôte…
          </div>
        )}
      </div>

      {showManager && (
        <WordpackManager
          onClose={() => setShowManager(false)}
          onChanged={setPacks}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  disabled,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">{label}</span>
        <button
          disabled={disabled}
          onClick={onToggle}
          className={`relative h-7 w-12 rounded-full transition disabled:opacity-60 ${
            on ? "bg-aubergine-400" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              on ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
    </div>
  );
}

function SecondsField({
  label,
  hint,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-white/60">{label}</label>
        <input
          type="number"
          min={0}
          max={600}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            onChange(Math.max(0, Math.min(600, parseInt(e.target.value, 10) || 0)))
          }
          className="input w-24 text-center disabled:opacity-50"
        />
      </div>
      {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
    </div>
  );
}
