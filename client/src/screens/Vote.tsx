import { useState } from "react";
import type { RoomState } from "../types";
import { PlayerCard } from "../components/PlayerCard";
import { Countdown } from "../components/Countdown";

interface Props {
  room: RoomState;
  myId: string | null;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
}

export function Vote({ room, myId, isHost, onAction }: Props) {
  const me = room.players.find((p) => p.id === myId);
  const alivePlayers = room.players.filter((p) => p.alive);
  const votesConfirmed = room.players.filter((p) => p.hasVoted).length;
  const canVote = !!me?.alive;
  const hasConfirmed = !!room.you?.votedFor;

  // Local, un-committed selection: a vote only counts once "Confirmer" is clicked.
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPlayer = room.players.find((p) => p.id === selected);

  function confirm() {
    if (!selected) return;
    onAction("vote:cast", { targetId: selected });
    setSelected(null);
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 text-center">
        <h2 className="neon-title text-4xl font-extrabold">🗳️ Phase de vote</h2>
        <p className="text-white/60">
          {canVote
            ? "Sélectionnez un joueur suspect, puis confirmez votre vote"
            : "Vous êtes éliminé, vous ne pouvez pas voter"}
        </p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="text-sm text-aubergine-300">
            {votesConfirmed} / {alivePlayers.length} votes confirmés
          </span>
          <Countdown deadline={room.voteDeadline} label="vote" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {room.players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            isMe={p.id === myId}
            votedByMe={selected === p.id || room.you?.votedFor === p.id}
            onVote={
              canVote && !hasConfirmed && p.alive && p.id !== myId
                ? () => setSelected(p.id)
                : undefined
            }
            voteLabel={hasConfirmed ? "✓ voté" : selected === p.id ? "✓ sélectionné" : "Choisir"}
          />
        ))}
      </div>

      {/* Confirmation bar, centered below the players. */}
      {canVote && !hasConfirmed && selectedPlayer && (
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <div className="text-lg">
            Confirme ton vote pour{" "}
            <span className="neon-title text-2xl font-extrabold">
              {selectedPlayer.pseudo}
            </span>
          </div>
          <button className="btn-primary" onClick={confirm}>
            Confirmer le vote
          </button>
          <div className="text-xs text-white/40">
            Touche un autre joueur pour changer ta sélection.
          </div>
        </div>
      )}

      {canVote && hasConfirmed && (
        <div className="mt-6 text-center text-sm font-semibold text-emerald-300">
          ✓ Vote confirmé — en attente des autres joueurs…
        </div>
      )}

      {isHost && votesConfirmed < alivePlayers.length && (
        <div className="mt-6 text-center">
          <button className="btn-ghost" onClick={() => onAction("vote:resolve")}>
            Forcer le résultat (si un joueur ne vote pas)
          </button>
        </div>
      )}
    </div>
  );
}
