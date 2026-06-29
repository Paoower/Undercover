import { useState } from "react";
import { ANIME_CHARACTERS, DEFAULT_AVATAR, avatarUrl } from "../avatars";

interface Props {
  onCreate: (pseudo: string, avatar: string) => void;
  onJoin: (code: string, pseudo: string, avatar: string) => void;
}

export function Home({ onCreate, onJoin }: Props) {
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [code, setCode] = useState("");

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

          <label className="mb-2 block text-sm text-white/60">
            Personnage d'anime
          </label>
          <div className="mb-5 grid max-h-56 grid-cols-6 gap-2 overflow-y-auto pr-1">
            {ANIME_CHARACTERS.map((c) => {
              const selected = avatar === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setAvatar(c.id)}
                  title={c.name}
                  className="aspect-square overflow-hidden rounded-full transition"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: selected
                      ? "0 0 0 2px #ff2e9a, 0 0 14px -2px rgba(255,46,154,0.8)"
                      : "0 0 0 1px rgba(255,255,255,0.12)",
                    transform: selected ? "scale(1.1)" : undefined,
                  }}
                >
                  <img
                    src={avatarUrl(c.id)}
                    alt={c.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full"
                    style={{ objectFit: "cover" }}
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
