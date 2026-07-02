import type { RoomState } from "../types";
import { AvatarCircle } from "../components/AvatarCircle";

interface Props {
  room: RoomState;
  myId: string | null;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
  onLeave: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  civil: "Civil",
  impostor: "Imposteur",
  misterwhite: "Mister White",
};
const ROLE_COLOR: Record<string, string> = {
  civil: "text-emerald-300",
  impostor: "text-red-300",
  misterwhite: "text-sky-300",
};

export function End({ room, myId, isHost, onAction, onLeave }: Props) {
  const civilsWin = room.winner === "civils";
  const showVotes = room.config.showVoteCounts;
  const me = room.players.find((p) => p.id === myId);
  // The host doesn't ready up — readiness is tracked for non-host players only.
  const others = room.players.filter((p) => p.id !== room.hostId);
  const readyCount = others.filter((p) => p.ready).length;
  const allReady = others.every((p) => p.ready);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 text-center anim-pop">
        <div className="text-7xl anim-floaty">{civilsWin ? "🎉" : "🕵️"}</div>
        <h1 className="neon-title mt-3 text-5xl font-extrabold">
          {civilsWin ? "Les Civils gagnent !" : "Les Imposteurs gagnent !"}
        </h1>
        <p className="mt-1 text-aubergine-200">{room.winReason}</p>
        {room.revealedWords && (
          <div className="mt-3 flex justify-center gap-6 text-sm">
            <span>
              Civils : <b className="text-emerald-300">{room.revealedWords.civil}</b>
            </span>
            <span>
              Imposteur : <b className="text-red-300">{room.revealedWords.impostor}</b>
            </span>
          </div>
        )}
      </div>

      <div className="card mb-6 p-4">
        <h2 className="mb-3 font-bold">Rôles révélés</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {room.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-xl bg-white/5 p-2"
            >
              <div className="relative">
                <AvatarCircle avatarId={p.avatar} size={40} dim={!p.alive} />
                {showVotes && (
                  <div
                    className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                    style={{
                      background: "linear-gradient(120deg,#ff2e9a,#8b5cd6)",
                      boxShadow: "0 0 10px -2px rgba(255,46,154,0.8)",
                    }}
                    title="Votes reçus (total de la partie)"
                  >
                    {room.voteCounts[p.id] || 0}
                  </div>
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  {p.pseudo}
                  {p.ready && (
                    <span className="text-emerald-400" title="Prêt">
                      ✓
                    </span>
                  )}
                </div>
                {p.role && (
                  <div className={`text-xs font-bold ${ROLE_COLOR[p.role]}`}>
                    {ROLE_LABEL[p.role]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-host players ready up; the host drives the relaunch instead. */}
      {me && !isHost && (
        <button
          className={`mb-3 w-full rounded-xl px-4 py-3 font-bold transition active:scale-95 ${
            me.ready ? "text-white" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          style={
            me.ready
              ? {
                  background: "linear-gradient(120deg,#34d399,#059669)",
                  boxShadow: "0 0 16px -3px rgba(52,211,153,0.8)",
                }
              : undefined
          }
          onClick={() => onAction("game:setReady", { ready: !me.ready })}
        >
          {me.ready ? "✓ Prêt — cliquer pour annuler" : "Je suis prêt à rejouer"}
        </button>
      )}

      {others.length > 0 && (
        <div className="mb-3 text-center text-sm text-white/50">
          {readyCount}/{others.length} joueurs prêts
        </div>
      )}

      {isHost ? (
        <div className="flex flex-col gap-3">
          <button
            className="btn-primary w-full"
            disabled={!allReady}
            onClick={() => onAction("game:restartNow")}
          >
            {allReady
              ? "Relancer une partie directement"
              : `En attente des joueurs (${readyCount}/${others.length} prêts)`}
          </button>
          <div className="flex gap-3">
            <button
              className="btn-ghost flex-1"
              onClick={() => onAction("game:restart")}
            >
              Revenir aux paramètres
            </button>
            <button className="btn-ghost flex-1" onClick={onLeave}>
              Quitter
            </button>
          </div>
        </div>
      ) : (
        <>
          <button className="btn-ghost w-full" onClick={onLeave}>
            Quitter
          </button>
          <div className="mt-3 text-center text-sm text-white/40">
            L'hôte peut relancer une partie ou revenir aux paramètres.
          </div>
        </>
      )}
    </div>
  );
}
