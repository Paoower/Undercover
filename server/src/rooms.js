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
      turnSeconds: 60, // per-turn time limit in seconds (0 = unlimited)
      voteSeconds: 60, // voting phase time limit in seconds (0 = unlimited)
      hideRolesUntilEnd: true, // hide civil/impostor distinction until game end
      showVoteCounts: false, // show per-player vote tallies on the end/reveal screen
      continueGame: true, // keep playing rounds until a camp wins (else end after 1st vote)
    },
    players: new Map(),
    // Game runtime state
    round: 0,
    wordNumber: 1, // current word number within a round (1..cluesPerPlayer)
    baseOrder: [], // alive players order for the current round
    civilWord: null,
    impostorWord: null,
    cluesThisRound: 1, // number of clues each player gives in the current round
    turnOrder: [],
    currentTurnIndex: 0,
    votes: {}, // voterId -> targetId
    lastVoteCounts: {}, // targetId -> count, from the last resolved vote
    lastEliminated: null, // {id, pseudo, role, avatar}
    misterWhiteGuessPending: null, // playerId awaiting guess
    winner: null, // 'civils' | 'impostors'
    winReason: null,
    // Server-authoritative deadlines (epoch ms) for the current turn / vote.
    turnDeadline: null,
    voteDeadline: null,
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
    ready: false, // "ready to replay" flag on the end screen
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
  const gameOver = room.phase === "ended";
  const hideRoles = !!room.config.hideRolesUntilEnd && !gameOver;

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
      ready: p.ready,
    };
    // Reveal role/word for the viewer themselves always; for other players only
    // when the game is over, or (when roles aren't being hidden) for eliminated
    // players and during the reveal phase.
    const revealOther =
      gameOver || (!hideRoles && (!p.alive || room.phase === "reveal"));
    if (p.id === viewerId || revealOther) {
      base.role = p.role;
      base.word = p.word;
    }
    return base;
  });

  const currentTurnId = room.turnOrder[room.currentTurnIndex] || null;

  // Per-player vote tallies stay hidden during voting (so live counts can't sway
  // votes). They're surfaced only after resolution, and only if the host enabled
  // "show vote counts".
  const voteCounts = {};
  if (
    room.config.showVoteCounts &&
    (room.phase === "reveal" || room.phase === "misterwhite" || gameOver)
  ) {
    Object.assign(voteCounts, room.lastVoteCounts || {});
  }

  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    config: room.config,
    round: room.round,
    wordNumber: room.wordNumber,
    cluesThisRound: room.cluesThisRound,
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
    hideRoles,
    turnDeadline: room.phase === "playing" ? room.turnDeadline : null,
    voteDeadline: room.phase === "voting" ? room.voteDeadline : null,
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
