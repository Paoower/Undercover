import { nanoid } from "nanoid";
import { defaultPackIds } from "./wordpacks.js";

// In-memory store of all rooms.
const rooms = new Map();

const ROOM_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateRoomCode() {
  let code;
  do {
    code = Array.from(
      { length: 4 },
      () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

export function createRoom(host) {
  const code = generateRoomCode();
  const playerId = nanoid(10);
  const room = {
    code,
    hostId: playerId,
    phase: "lobby",
    config: {
      numImpostors: 1,
      misterWhiteEnabled: false,
      wordpackIds: defaultPackIds(),
      cluesPerPlayer: 2,
    },
    players: new Map(),
    // Game runtime state
    round: 0,
    wordNumber: 1, // current word number within a round (1..cluesPerPlayer)
    baseOrder: [], // alive players order for the current round
    civilWord: null,
    impostorWord: null,
    turnOrder: [],
    currentTurnIndex: 0,
    votes: {}, // voterId -> targetId
    lastEliminated: null, // {id, pseudo, role, avatar}
    misterWhiteGuessPending: null, // playerId awaiting guess
    winner: null, // 'civils' | 'impostors'
    winReason: null,
  };
  room.players.set(playerId, makePlayer(playerId, host, true));
  rooms.set(code, room);
  return { room, playerId };
}

function makePlayer(id, { pseudo, avatar }, isHost) {
  return {
    id,
    socketId: null,
    pseudo,
    avatar,
    isHost,
    connected: true,
    role: null, // 'civil' | 'impostor' | 'misterwhite'
    word: null,
    alive: true,
    clues: [], // string per round
    votedFor: null,
  };
}

export function getRoom(code) {
  return rooms.get(code) || null;
}

export function joinRoom(code, { pseudo, avatar }) {
  const room = rooms.get(code);
  if (!room) return { error: "Room introuvable" };

  // Reconnect by same pseudo if that player is currently disconnected.
  const existing = [...room.players.values()].find(
    (p) => p.pseudo.toLowerCase() === pseudo.toLowerCase()
  );
  if (existing) {
    if (existing.connected) {
      return { error: "Ce pseudo est déjà utilisé dans cette partie" };
    }
    existing.connected = true;
    return { room, playerId: existing.id, reconnected: true };
  }

  if (room.phase !== "lobby") {
    return { error: "La partie a déjà commencé" };
  }
  const playerId = nanoid(10);
  room.players.set(playerId, makePlayer(playerId, { pseudo, avatar }, false));
  return { room, playerId };
}

export function rejoinRoom(code, playerId) {
  const room = rooms.get(code);
  if (!room) return { error: "Room introuvable" };
  const player = room.players.get(playerId);
  if (!player) return { error: "Joueur introuvable" };
  player.connected = true;
  return { room, playerId };
}

export function removeRoom(code) {
  rooms.delete(code);
}

// Return a view of the room tailored to one player (hides other players' secrets).
export function sanitizeRoomFor(room, viewerId) {
  const viewer = room.players.get(viewerId);
  const revealAll = room.phase === "ended" || room.phase === "reveal";

  const players = [...room.players.values()].map((p) => {
    const base = {
      id: p.id,
      pseudo: p.pseudo,
      avatar: p.avatar,
      isHost: p.isHost,
      connected: p.connected,
      alive: p.alive,
      clues: p.clues,
      hasVoted: room.phase === "voting" ? p.votedFor !== null : false,
    };
    // Reveal role/word for: the viewer themselves, eliminated players, or end game.
    if (p.id === viewerId || !p.alive || revealAll) {
      base.role = p.role;
      base.word = p.word;
    }
    return base;
  });

  const currentTurnId = room.turnOrder[room.currentTurnIndex] || null;

  // Vote tally is public during voting.
  const voteCounts = {};
  if (room.phase === "voting") {
    for (const targetId of Object.values(room.votes)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  }

  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    config: room.config,
    round: room.round,
    wordNumber: room.wordNumber,
    players,
    currentTurnId,
    you: viewer
      ? {
          id: viewer.id,
          role: viewer.role,
          word: viewer.word,
          alive: viewer.alive,
          isHost: viewer.isHost,
          votedFor: viewer.votedFor,
        }
      : null,
    voteCounts,
    lastEliminated: room.lastEliminated,
    misterWhiteGuessPending: room.misterWhiteGuessPending,
    winner: room.winner,
    winReason: room.winReason,
    // Only reveal the secret words at game end.
    revealedWords:
      room.phase === "ended"
        ? { civil: room.civilWord, impostor: room.impostorWord }
        : null,
  };
}

export { rooms };
