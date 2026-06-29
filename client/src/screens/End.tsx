import type { RoomState } from "../types";
import { AvatarCircle } from "../components/AvatarCircle";

interface Props {
  room: RoomState;
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

export function End({ room, isHost, onAction, onLeave }: Props) {
  const civilsWin = room.winner === "civils";
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
              <AvatarCircle avatarId={p.avatar} size={40} dim={!p.alive} />
              <div className="truncate">
                <div className="text-sm font-semibold">{p.pseudo}</div>
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

      <div className="flex gap-3">
        {isHost && (
          <button className="btn-primary flex-1" onClick={() => onAction("game:restart")}>
            Rejouer
          </button>
        )}
        <button className="btn-ghost flex-1" onClick={onLeave}>
          Quitter
        </button>
      </div>
      {!isHost && (
        <div className="mt-3 text-center text-sm text-white/40">
          L'hôte peut relancer une partie.
        </div>
      )}
    </div>
  );
}
