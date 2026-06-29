import type { YouView } from "../types";

const ROLE_LABEL: Record<string, string> = {
  civil: "Civil",
  impostor: "Imposteur",
  misterwhite: "Mister White",
};

export function RoleCard({ you }: { you: YouView }) {
  if (!you.role) return null;
  const isWhite = you.role === "misterwhite";
  const roleColor =
    you.role === "impostor"
      ? "#ff5d7a"
      : you.role === "misterwhite"
        ? "#38bdf8"
        : "#34d399";
  return (
    <div className="card card-glow anim-pop p-4 text-center">
      <div className="text-xs uppercase tracking-widest text-aubergine-300">
        Votre carte secrète
      </div>
      <div className="mt-1 text-sm text-white/60">
        Vous êtes{" "}
        <span className="font-bold" style={{ color: roleColor }}>
          {ROLE_LABEL[you.role]}
        </span>
      </div>
      <div
        className="mt-3 rounded-xl px-4 py-6"
        style={{
          background: "rgba(0,0,0,0.45)",
          boxShadow: `inset 0 0 30px -10px ${roleColor}, 0 0 0 1px ${roleColor}55`,
        }}
      >
        {isWhite ? (
          <div className="text-xl font-bold text-sky-300">❓ Devinez le mot</div>
        ) : (
          <div className="text-3xl font-extrabold tracking-wide">{you.word}</div>
        )}
      </div>
      {!you.alive && (
        <div className="mt-2 text-sm font-semibold text-red-300">
          Vous avez été éliminé
        </div>
      )}
    </div>
  );
}
