export type Role = "civil" | "impostor" | "misterwhite";
export type Phase =
  | "lobby"
  | "playing"
  | "voting"
  | "reveal"
  | "misterwhite"
  | "ended";

export interface PlayerView {
  id: string;
  pseudo: string;
  avatar: string;
  isHost: boolean;
  connected: boolean;
  alive: boolean;
  clues: string[];
  hasVoted: boolean;
  role?: Role;
  word?: string | null;
}

export interface RoomConfig {
  numImpostors: number;
  misterWhiteEnabled: boolean;
  wordpackId: string;
  numRounds: number;
}

export interface YouView {
  id: string;
  role: Role | null;
  word: string | null;
  alive: boolean;
  isHost: boolean;
  votedFor: string | null;
}

export interface RoomState {
  code: string;
  phase: Phase;
  hostId: string;
  config: RoomConfig;
  round: number;
  players: PlayerView[];
  currentTurnId: string | null;
  you: YouView | null;
  voteCounts: Record<string, number>;
  lastEliminated: { id: string; pseudo: string; avatar: string; role: Role } | null;
  misterWhiteGuessPending: string | null;
  winner: "civils" | "impostors" | null;
  winReason: string | null;
  revealedWords: { civil: string; impostor: string } | null;
}

export interface WordPair {
  civil: string;
  imposteur: string;
}

export interface PackSummary {
  id: string;
  name: string;
  theme: string;
  count: number;
}

export interface WordPack {
  id: string;
  name: string;
  theme: string;
  pairs: WordPair[];
}
