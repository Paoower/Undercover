import type { RoomState } from "../types";
import { PlayerCard } from "../components/PlayerCard";

interface Props {
  room: RoomState;
  myId: string | null;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
}

export function Vote({ room, myId, isHost, onAction }: Props) {
  const me = room.players.find((p) => p.id === myId);
  const alivePlayers = room.players.filter((p) => p.alive);
  const totalVotes = Object.values(room.voteCounts).reduce((a, b) => a + b, 0);
  const canVote = me?.alive;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 text-center">
        <h2 className="neon-title text-4xl font-extrabold">🗳️ Phase de vote</h2>
        <p className="text-white/60">
          {canVote
            ? "Votez pour éliminer un joueur suspect"
            : "Vous êtes éliminé, vous ne pouvez pas voter"}
        </p>
        <div className="mt-1 text-sm text-aubergine-300">
          {totalVotes} / {alivePlayers.length} votes
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {room.players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            isMe={p.id === myId}
            voteCount={room.voteCounts[p.id] || 0}
            votedByMe={room.you?.votedFor === p.id}
            onVote={
              canVote && p.alive && p.id !== myId
                ? () => onAction("vote:cast", { targetId: p.id })
                : undefined
            }
          />
        ))}
      </div>

      {isHost && totalVotes < alivePlayers.length && (
        <div className="mt-6 text-center">
          <button className="btn-ghost" onClick={() => onAction("vote:resolve")}>
            Forcer le résultat (si un joueur ne vote pas)
          </button>
        </div>
      )}
    </div>
  );
}
