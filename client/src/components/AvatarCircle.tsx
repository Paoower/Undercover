import { avatarById } from "../avatars";

interface Props {
  avatarId: string;
  size?: number;
  dim?: boolean;
  ring?: boolean;
}

export function AvatarCircle({ avatarId, size = 56, dim = false, ring = true }: Props) {
  const a = avatarById(avatarId);
  return (
    <div
      className="flex items-center justify-center rounded-full transition"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: `radial-gradient(circle at 50% 35%, ${a.color}44, ${a.color}11)`,
        boxShadow: ring
          ? `0 0 0 2px ${a.color}, 0 0 18px -4px ${a.color}`
          : undefined,
        filter: dim ? "grayscale(1) opacity(0.45)" : undefined,
      }}
    >
      <span>{a.emoji}</span>
    </div>
  );
}
