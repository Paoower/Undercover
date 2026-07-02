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
  ready: boolean;
  role?: Role;
  word?: string | null;
}

export interface RoomConfig {
  numImpostors: number;
  misterWhiteEnabled: boolean;
  wordpackIds: string[];
  cluesPerPlayer: number;
  turnSeconds: number;
  voteSeconds: number;
  hideRolesUntilEnd: boolean;
  showVoteCounts: boolean;
  continueGame: boolean;
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
  wordNumber: number;
  cluesThisRound: number;
  players: PlayerView[];
  currentTurnId: string | null;
  you: YouView | null;
  voteCounts: Record<string, number>;
  hideRoles: boolean;
  turnDeadline: number | null;
  voteDeadline: number | null;
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
  owned?: boolean;
  shared?: boolean;
}

export interface WordPack {
  id: string;
  name: string;
  theme: string;
  pairs: WordPair[];
  ownerId?: string | null;
}
