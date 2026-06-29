import { useState } from "react";
import type { RoomState } from "../types";
import { AvatarCircle } from "../components/AvatarCircle";

interface Props {
  room: RoomState;
  myId: string | null;
  isHost: boolean;
  onAction: (event: string, payload?: any) => void;
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

export function Reveal({ room, myId, isHost, onAction }: Props) {
  const [guess, setGuess] = useState("");
  const elim = room.lastEliminated;
  const isMisterWhitePhase = room.phase === "misterwhite";
  const iAmGuessing = room.misterWhiteGuessPending === myId;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
      {elim ? (
        <div className="anim-pop flex flex-col items-center">
          <div className="mb-2 text-sm uppercase tracking-widest text-white/50">
            Joueur éliminé
          </div>
          <div className="anim-floaty">
            <AvatarCircle avatarId={elim.avatar} size={96} />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{elim.pseudo}</div>
          <div className={`mt-1 text-xl font-bold ${ROLE_COLOR[elim.role]}`}>
            {ROLE_LABEL[elim.role]}
          </div>
        </div>
      ) : (
        <div className="text-2xl font-bold">Aucun joueur éliminé (égalité)</div>
      )}

      {isMisterWhitePhase && (
        <div className="card mt-6 w-full p-5">
          <div className="text-lg font-bold text-sky-300">
            Mister White éliminé !
          </div>
          {iAmGuessing ? (
            <>
              <p className="mt-2 text-sm text-white/60">
                Dernière chance : devinez le mot des civils pour gagner.
              </p>
              <input
                className="input mt-3"
                placeholder="Votre proposition…"
                value={guess}
                autoFocus
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  guess.trim() &&
                  onAction("misterwhite:guess", { guess: guess.trim() })
                }
              />
              <button
                className="btn-primary mt-3 w-full"
                disabled={!guess.trim()}
                onClick={() => onAction("misterwhite:guess", { guess: guess.trim() })}
              >
                Tenter ma chance
              </button>
            </>
          ) : (
            <p className="mt-2 text-white/60">
              {elim?.pseudo} tente de deviner le mot des civils…
            </p>
          )}
        </div>
      )}

      {!isMisterWhitePhase && isHost && (
        <button className="btn-primary mt-8" onClick={() => onAction("game:nextRound")}>
          Continuer →
        </button>
      )}
      {!isMisterWhitePhase && !isHost && (
        <div className="mt-8 text-white/50">En attente de l'hôte…</div>
      )}
    </div>
  );
}
