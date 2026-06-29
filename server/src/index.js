import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

import {
  createRoom,
  joinRoom,
  rejoinRoom,
  getRoom,
  sanitizeRoomFor,
  removeRoom,
} from "./rooms.js";
import {
  startGame,
  submitClue,
  goToVote,
  castVote,
  resolveVotes,
  misterWhiteGuess,
  nextRound,
  restartGame,
} from "./game.js";
import {
  listPacks,
  getPack,
  savePack,
  deletePack,
  parseBulk,
} from "./wordpacks.js";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// In production, serve the built client (single-service deployment).
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, "..", "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback for non-API routes.
  app.get(/^\/(?!socket\.io|health).*/, (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
  console.log("Serving client from", clientDist);
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  // Be tolerant of backgrounded tabs (throttled timers) before declaring a
  // socket disconnected.
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Grace periods (ms) so a brief disconnect (tab backgrounded, network blip)
// doesn't destroy the room or the player's seat.
const PLAYER_GRACE_MS = 120000; // remove a disconnected lobby player after this
const ROOM_EMPTY_GRACE_MS = 300000; // delete a room with nobody connected
const playerTimers = new Map(); // `${code}:${pid}` -> timeout
const roomTimers = new Map(); // code -> timeout

function clearPlayerTimer(code, pid) {
  const key = `${code}:${pid}`;
  const t = playerTimers.get(key);
  if (t) {
    clearTimeout(t);
    playerTimers.delete(key);
  }
}
function clearRoomTimer(code) {
  const t = roomTimers.get(code);
  if (t) {
    clearTimeout(t);
    roomTimers.delete(code);
  }
}

// Broadcast a tailored room state to every connected player in the room.
function broadcastRoom(room) {
  for (const player of room.players.values()) {
    if (player.socketId) {
      io.to(player.socketId).emit("room:state", sanitizeRoomFor(room, player.id));
    }
  }
}

// Remove a player for good, reassigning host and cleaning up an empty room.
function removePlayer(room, playerId) {
  clearPlayerTimer(room.code, playerId);
  room.players.delete(playerId);
  if (room.hostId === playerId) {
    const next = [...room.players.values()][0];
    if (next) {
      room.hostId = next.id;
      next.isHost = true;
    }
  }
  if (room.players.size === 0) {
    clearRoomTimer(room.code);
    removeRoom(room.code);
    return;
  }
  broadcastRoom(room);
}

// If nobody is connected, schedule deletion of the room after a grace period.
function scheduleRoomCleanup(room) {
  const anyConnected = [...room.players.values()].some((p) => p.connected);
  if (anyConnected) {
    clearRoomTimer(room.code);
    return;
  }
  clearRoomTimer(room.code);
  roomTimers.set(
    room.code,
    setTimeout(() => {
      roomTimers.delete(room.code);
      const stillEmpty = [...room.players.values()].every((p) => !p.connected);
      if (stillEmpty) removeRoom(room.code);
    }, ROOM_EMPTY_GRACE_MS)
  );
}

io.on("connection", (socket) => {
  // Track which room/player this socket is bound to.
  socket.data.code = null;
  socket.data.playerId = null;

  function bind(room, playerId) {
    socket.data.code = room.code;
    socket.data.playerId = playerId;
    const player = room.players.get(playerId);
    if (player) {
      player.socketId = socket.id;
      player.connected = true;
    }
    // Reconnected: cancel any pending removal/cleanup.
    clearPlayerTimer(room.code, playerId);
    clearRoomTimer(room.code);
    socket.join(room.code);
  }

  function getBoundRoom() {
    if (!socket.data.code) return null;
    return getRoom(socket.data.code);
  }

  function isHost(room) {
    return room && socket.data.playerId === room.hostId;
  }

  // ----- Wordpacks (available anytime) -----
  socket.on("wordpacks:list", (_p, cb) => cb?.(listPacks()));
  socket.on("wordpacks:get", (id, cb) => cb?.(getPack(id)));
  socket.on("wordpacks:save", (payload, cb) => {
    const pack = savePack(payload);
    cb?.({ ok: true, pack });
    io.emit("wordpacks:changed", listPacks());
  });
  socket.on("wordpacks:delete", (id, cb) => {
    const ok = deletePack(id);
    cb?.({ ok });
    io.emit("wordpacks:changed", listPacks());
  });
  socket.on("wordpacks:parseBulk", (text, cb) => cb?.(parseBulk(text)));

  // ----- Room lifecycle -----
  socket.on("room:create", ({ pseudo, avatar }, cb) => {
    const { room, playerId } = createRoom({ pseudo, avatar });
    bind(room, playerId);
    cb?.({ ok: true, code: room.code, playerId });
    broadcastRoom(room);
  });

  socket.on("room:join", ({ code, pseudo, avatar }, cb) => {
    const result = joinRoom(String(code || "").toUpperCase(), { pseudo, avatar });
    if (result.error) return cb?.({ ok: false, error: result.error });
    bind(result.room, result.playerId);
    cb?.({ ok: true, code: result.room.code, playerId: result.playerId });
    broadcastRoom(result.room);
  });

  socket.on("room:rejoin", ({ code, playerId }, cb) => {
    const result = rejoinRoom(String(code || "").toUpperCase(), playerId);
    if (result.error) return cb?.({ ok: false, error: result.error });
    bind(result.room, result.playerId);
    cb?.({ ok: true, code: result.room.code, playerId: result.playerId });
    broadcastRoom(result.room);
  });

  // ----- Lobby config (host only) -----
  socket.on("lobby:updateConfig", (config, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    if (room.phase !== "lobby") return cb?.({ ok: false, error: "Partie déjà lancée" });
    const wordpackIds = Array.isArray(config.wordpackIds)
      ? config.wordpackIds.filter((id) => typeof id === "string")
      : [];
    room.config = {
      numImpostors: Math.max(1, parseInt(config.numImpostors, 10) || 1),
      misterWhiteEnabled: !!config.misterWhiteEnabled,
      wordpackIds,
      cluesPerPlayer: Math.min(5, Math.max(1, parseInt(config.cluesPerPlayer, 10) || 2)),
    };
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  // ----- Game actions -----
  socket.on("game:start", (_p, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    const res = startGame(room);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("game:submitClue", ({ clue }, cb) => {
    const room = getBoundRoom();
    if (!room) return cb?.({ ok: false, error: "Room introuvable" });
    const res = submitClue(room, socket.data.playerId, clue);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("game:goToVote", (_p, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    const res = goToVote(room);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("vote:cast", ({ targetId }, cb) => {
    const room = getBoundRoom();
    if (!room) return cb?.({ ok: false, error: "Room introuvable" });
    const res = castVote(room, socket.data.playerId, targetId);
    if (res.error) return cb?.({ ok: false, error: res.error });
    // Auto-resolve once every alive player has voted.
    if (res.allVoted) resolveVotes(room);
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("vote:resolve", (_p, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    const res = resolveVotes(room);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("misterwhite:guess", ({ guess }, cb) => {
    const room = getBoundRoom();
    if (!room) return cb?.({ ok: false, error: "Room introuvable" });
    const res = misterWhiteGuess(room, socket.data.playerId, guess);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true, correct: res.correct });
    broadcastRoom(room);
  });

  socket.on("game:nextRound", (_p, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    const res = nextRound(room);
    if (res.error) return cb?.({ ok: false, error: res.error });
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("game:restart", (_p, cb) => {
    const room = getBoundRoom();
    if (!room || !isHost(room)) return cb?.({ ok: false, error: "Action réservée à l'hôte" });
    restartGame(room);
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on("room:leave", () => {
    const room = getBoundRoom();
    if (!room) return;
    const player = room.players.get(socket.data.playerId);
    handleLeave(room, player, true);
  });

  socket.on("disconnect", () => {
    const room = getBoundRoom();
    if (!room) return;
    const player = room.players.get(socket.data.playerId);
    handleLeave(room, player, false);
  });

  function handleLeave(room, player, hard) {
    if (!player) return;

    if (hard) {
      // Explicit leave: remove immediately.
      removePlayer(room, player.id);
      return;
    }

    // Disconnect: keep the seat for reconnection, just mark as disconnected.
    player.connected = false;
    player.socketId = null;

    if (room.phase === "lobby") {
      // Lobby has no turn dependency: drop ghost players after a grace period.
      const key = `${room.code}:${player.id}`;
      clearPlayerTimer(room.code, player.id);
      playerTimers.set(
        key,
        setTimeout(() => {
          playerTimers.delete(key);
          const p = room.players.get(player.id);
          if (p && !p.connected) removePlayer(room, player.id);
        }, PLAYER_GRACE_MS)
      );
    }

    scheduleRoomCleanup(room);
    broadcastRoom(room);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Undercover server listening on http://localhost:${PORT}`);
});
