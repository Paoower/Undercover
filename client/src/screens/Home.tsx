import { useState } from "react";
import { AVATARS } from "../avatars";
import { Glyph } from "../components/Glyph";

interface Props {
  onCreate: (pseudo: string, avatar: string) => void;
  onJoin: (code: string, pseudo: string, avatar: string) => void;
}

export function Home({ onCreate, onJoin }: Props) {
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0].id);
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

          <label className="mb-2 block text-sm text-white/60">Avatar</label>
          <div className="mb-5 grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvatar(a.id)}
                className="flex aspect-square items-center justify-center rounded-full text-white transition"
                style={{
                  background:
                    avatar === a.id ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
                  boxShadow:
                    avatar === a.id
                      ? "0 0 0 2px #fff, 0 0 14px -2px rgba(255,255,255,0.7)"
                      : "0 0 0 1px rgba(255,255,255,0.12)",
                  transform: avatar === a.id ? "scale(1.1)" : undefined,
                }}
              >
                <Glyph shape={a.shape} size={24} />
              </button>
            ))}
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
