import type { PlayerView } from "../types";
import { AvatarCircle } from "./AvatarCircle";

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

interface Props {
  player: PlayerView;
  isCurrentTurn?: boolean;
  isMe?: boolean;
  voteCount?: number;
  onVote?: () => void;
  votedByMe?: boolean;
}

export function PlayerCard({
  player,
  isCurrentTurn,
  isMe,
  voteCount,
  onVote,
  votedByMe,
}: Props) {
  return (
    <div
      className={`card anim-pop relative flex flex-col items-center p-3 transition ${
        !player.alive ? "opacity-60 grayscale" : ""
      }`}
      style={
        isCurrentTurn
          ? { animation: "pulseGlow 2s ease-in-out infinite, popIn 0.4s both" }
          : undefined
      }
    >
      {isCurrentTurn && (
        <div
          className="absolute -top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: "linear-gradient(120deg,#ff2e9a,#8b5cd6)" }}
        >
          au tour
        </div>
      )}
      {typeof voteCount === "number" && voteCount > 0 && (
        <div
          key={voteCount}
          className="anim-pop absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-sm font-bold text-white shadow-lg"
          style={{
            background: "linear-gradient(120deg,#ff2e9a,#b91c5c)",
            boxShadow: "0 0 14px 1px rgba(255,46,154,0.8)",
          }}
        >
          {voteCount}
        </div>
      )}

      <AvatarCircle avatarId={player.avatar} dim={!player.alive} size={52} />

      <div className="mt-2 flex items-center gap-1 text-sm font-semibold">
        {player.pseudo}
        {player.isHost && <span title="Hôte">👑</span>}
        {isMe && <span className="text-aubergine-300">(vous)</span>}
      </div>

      {!player.connected && (
        <div className="text-[10px] text-amber-300">déconnecté…</div>
      )}

      {player.role && !player.alive && (
        <div className={`text-xs font-bold ${ROLE_COLOR[player.role]}`}>
          {ROLE_LABEL[player.role]}
        </div>
      )}

      {/* Stacked clues */}
      <div className="mt-2 flex w-full flex-col gap-1">
        {player.clues.map((c, i) => (
          <div
            key={i}
            className="anim-pop truncate rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-center text-xs text-aubergine-100"
            title={c}
          >
            {c}
          </div>
        ))}
      </div>

      {onVote && player.alive && (
        <button
          onClick={onVote}
          className={`mt-2 w-full rounded-lg px-2 py-1.5 text-xs font-bold transition active:scale-95 ${
            votedByMe ? "text-white" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          style={
            votedByMe
              ? {
                  background: "linear-gradient(120deg,#ff2e9a,#8b5cd6)",
                  boxShadow: "0 0 14px -2px rgba(255,46,154,0.8)",
                }
              : undefined
          }
        >
          {votedByMe ? "✓ voté" : "Voter"}
        </button>
      )}

      {player.hasVoted && !onVote && (
        <div className="mt-1 text-[10px] text-emerald-300">a voté</div>
      )}
    </div>
  );
}
