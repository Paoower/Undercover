// A dozen stylised emoji avatars with matching ring colors.
export interface Avatar {
  id: string;
  emoji: string;
  color: string;
}

export const AVATARS: Avatar[] = [
  { id: "fox", emoji: "🦊", color: "#f97316" },
  { id: "cat", emoji: "🐱", color: "#a855f7" },
  { id: "panda", emoji: "🐼", color: "#64748b" },
  { id: "frog", emoji: "🐸", color: "#22c55e" },
  { id: "owl", emoji: "🦉", color: "#eab308" },
  { id: "unicorn", emoji: "🦄", color: "#ec4899" },
  { id: "robot", emoji: "🤖", color: "#06b6d4" },
  { id: "alien", emoji: "👽", color: "#84cc16" },
  { id: "ghost", emoji: "👻", color: "#e2e8f0" },
  { id: "dragon", emoji: "🐲", color: "#10b981" },
  { id: "lion", emoji: "🦁", color: "#f59e0b" },
  { id: "penguin", emoji: "🐧", color: "#3b82f6" },
];

export function avatarById(id: string): Avatar {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
