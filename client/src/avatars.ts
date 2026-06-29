// Monochrome avatars: distinct geometric shapes (rendered as white SVG glyphs).
export interface Avatar {
  id: string;
  shape: string;
}

export const AVATARS: Avatar[] = [
  { id: "circle", shape: "circle" },
  { id: "ring", shape: "ring" },
  { id: "triangle", shape: "triangle" },
  { id: "square", shape: "square" },
  { id: "diamond", shape: "diamond" },
  { id: "star", shape: "star" },
  { id: "hexagon", shape: "hexagon" },
  { id: "pentagon", shape: "pentagon" },
  { id: "plus", shape: "plus" },
  { id: "bolt", shape: "bolt" },
  { id: "droplet", shape: "droplet" },
  { id: "cross", shape: "cross" },
];

export function avatarById(id: string): Avatar {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
