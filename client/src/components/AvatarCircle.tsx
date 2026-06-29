import { avatarUrl } from "../avatars";

interface Props {
  avatarId: string;
  size?: number;
  dim?: boolean;
  ring?: boolean;
}

export function AvatarCircle({ avatarId, size = 56, dim = false, ring = true }: Props) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full transition"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.06)",
        boxShadow: ring ? "0 0 0 2px rgba(139,92,214,0.7)" : undefined,
        opacity: dim ? 0.4 : 1,
      }}
    >
      <img
        src={avatarUrl(avatarId)}
        alt=""
        loading="lazy"
        draggable={false}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    </div>
  );
}
