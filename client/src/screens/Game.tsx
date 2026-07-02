import { useState } from "react";
import type { RoomState } from "../types";
import { PlayerCard } from "../components/PlayerCard";
import { RoleCard } from "../components/RoleCard";
import { Countdown } from "../components/Countdown";

interface Props {
  room: RoomState;
  myId: string | null;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
}

export function Game({ room, myId, isHost, onAction }: Props) {
  const [clue, setClue] = useState("");
  const myTurn = room.currentTurnId === myId;
  const me = room.players.find((p) => p.id === myId);
  const currentPlayer = room.players.find((p) => p.id === room.currentTurnId);
  const allSpoke = room.currentTurnId === null;

  function submit() {
    const text = clue.trim();
    if (!text) return;
    onAction("game:submitClue", { clue: text });
    setClue("");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-white/50">
          Code <span className="font-bold text-aubergine-200">{room.code}</span>
        </div>
        <div className="flex gap-2">
          <div className="chip">🔁 Manche {room.round}</div>
          <div className="chip">
            🃏 Mot n°{room.wordNumber}/{room.cluesThisRound || room.config.cluesPerPlayer}
          </div>
          {!allSpoke && <Countdown deadline={room.turnDeadline} />}
        </div>
      </div>

      {/* Turn banner */}
      <div className="card card-glow mb-4 p-4 text-center">
        {allSpoke ? (
          <div className="text-lg font-bold text-aubergine-200">
            ✅ Tout le monde a parlé !
          </div>
        ) : (
          <div className="text-lg">
            Au tour de :{" "}
            <span className="neon-title text-2xl font-extrabold">
              {currentPlayer?.pseudo}
            </span>
          </div>
        )}
      </div>

      {/* My secret card */}
      {me && room.you && (
        <div className="mb-4">
          <RoleCard you={room.you} hideRoles={room.hideRoles} />
        </div>
      )}

      {/* Clue input */}
      {myTurn && me?.alive && (
        <div className="card mb-4 flex gap-2 p-3">
          <input
            className="input"
            placeholder="Entrez votre mot-clé…"
            value={clue}
            autoFocus
            onChange={(e) => setClue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button className="btn-primary shrink-0" onClick={submit}>
            Valider
          </button>
        </div>
      )}

      {/* Players grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {room.players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            isMe={p.id === myId}
            isCurrentTurn={p.id === room.currentTurnId}
          />
        ))}
      </div>

      {/* The vote starts automatically once everyone has placed their words. */}
      <div className="mt-6 text-center text-sm text-white/40">
        {allSpoke
          ? "Lancement du vote…"
          : "Le vote démarrera automatiquement quand chacun aura posé ses mots."}
      </div>
    </div>
  );
}
