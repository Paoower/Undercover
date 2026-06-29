import { useState } from "react";
import {
  AVATAR_STYLES,
  AVATAR_SEEDS,
  avatarUrl,
  makeAvatar,
} from "../avatars";

interface Props {
  onCreate: (pseudo: string, avatar: string) => void;
  onJoin: (code: string, pseudo: string, avatar: string) => void;
}

export function Home({ onCreate, onJoin }: Props) {
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [pseudo, setPseudo] = useState("");
  const [style, setStyle] = useState(AVATAR_STYLES[0].id);
  const [seed, setSeed] = useState(AVATAR_SEEDS[0]);
  const [code, setCode] = useState("");

  const avatar = makeAvatar(style, seed);
  const canSubmit = pseudo.trim().length >= 2;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6">
      <div className="mb-8 text-center anim-pop">
        <div className="text-7xl anim-floaty">🕵️</div>
        <h1 className="neon-title mt-3 text-6xl font-extrabold tracking-tight">
          Undercover
        </h1>
        <p className="mt-2 text-aubergine-200">Démasquez l'imposteur</p>
      </div>

      {mode === "home" && (
        <div className="flex w-full flex-col gap-3 anim-fade-up">
          <button className="btn-primary text-lg" onClick={() => setMode("create")}>
            🎭 Créer une partie
          </button>
          <button className="btn-ghost text-lg" onClick={() => setMode("join")}>
            🔑 Rejoindre une partie
          </button>
        </div>
      )}

      {(mode === "create" || mode === "join") && (
        <div className="card card-glow w-full p-5 anim-fade-up">
          <button
            className="mb-3 text-sm text-aubergine-300 hover:text-white"
            onClick={() => setMode("home")}
          >
            ← Retour
          </button>

          {mode === "join" && (
            <input
              className="input mb-3 text-center text-2xl font-bold uppercase tracking-widest"
              placeholder="CODE"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          )}

          <label className="mb-1 block text-sm text-white/60">Pseudo</label>
          <input
            className="input mb-4"
            placeholder="Votre pseudo"
            maxLength={16}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />

          <label className="mb-2 block text-sm text-white/60">Style d'avatar</label>
          <div className="mb-3 flex flex-wrap gap-2">
            {AVATAR_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition active:scale-95 ${
                  style === s.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
                style={{
                  border:
                    style === s.id
                      ? "1px solid #fff"
                      : "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm text-white/60">Personnage</label>
          <div className="mb-5 grid grid-cols-6 gap-2">
            {AVATAR_SEEDS.map((sd) => {
              const selected = seed === sd;
              return (
                <button
                  key={sd}
                  onClick={() => setSeed(sd)}
                  title={sd}
                  className="aspect-square overflow-hidden rounded-full transition"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    boxShadow: selected
                      ? "0 0 0 2px #fff, 0 0 14px -2px rgba(255,255,255,0.8)"
                      : "0 0 0 1px rgba(255,255,255,0.12)",
                    transform: selected ? "scale(1.1)" : undefined,
                  }}
                >
                  <img
                    src={avatarUrl(makeAvatar(style, sd))}
                    alt={sd}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full"
                  />
                </button>
              );
            })}
          </div>

          <button
            className="btn-primary w-full text-lg"
            disabled={!canSubmit || (mode === "join" && code.length !== 4)}
            onClick={() =>
              mode === "create"
                ? onCreate(pseudo.trim(), avatar)
                : onJoin(code, pseudo.trim(), avatar)
            }
          >
            {mode === "create" ? "Créer" : "Rejoindre"}
          </button>
        </div>
      )}
    </div>
  );
}
