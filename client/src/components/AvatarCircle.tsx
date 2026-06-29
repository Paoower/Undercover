import { avatarById } from "../avatars";
import { Glyph } from "./Glyph";

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
      className="flex items-center justify-center rounded-full text-white transition"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.06)",
        boxShadow: ring ? "0 0 0 1px rgba(255,255,255,0.35)" : undefined,
        opacity: dim ? 0.4 : 1,
      }}
    >
      <Glyph shape={a.shape} size={size * 0.5} />
    </div>
  );
}
