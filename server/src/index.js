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
});

// Broadcast a tailored room state to every connected player in the room.
function broadcastRoom(room) {
  for (const player of room.players.values()) {
    if (player.socketId) {
      io.to(player.socketId).emit("room:state", sanitizeRoomFor(room, player.id));
    }
  }
}

io.on("connection", (socket) => {
  // Track which room/player this socket is bound to.
  socket.data.code = null;
  socket.data.playerId = null;

  function bind(room, playerId) {
    socket.data.code = room.code;
    socket.data.playerId = playerId;
    const player = room.players.get(playerId);
    if (player) player.socketId = socket.id;
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
    room.config = {
      numImpostors: Math.max(1, parseInt(config.numImpostors, 10) || 1),
      misterWhiteEnabled: !!config.misterWhiteEnabled,
      wordpackId: config.wordpackId || "default",
      numRounds: Math.max(1, parseInt(config.numRounds, 10) || 10),
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
    if (room.phase === "lobby" || hard) {
      // In lobby (or explicit leave): remove the player entirely.
      room.players.delete(player.id);
      // Reassign host if needed.
      if (room.hostId === player.id) {
        const next = [...room.players.values()][0];
        if (next) {
          room.hostId = next.id;
          next.isHost = true;
        }
      }
      if (room.players.size === 0) {
        removeRoom(room.code);
        return;
      }
    } else {
      // Mid-game: keep their seat but mark disconnected for reconnection.
      player.connected = false;
      player.socketId = null;
    }
    broadcastRoom(room);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Undercover server listening on http://localhost:${PORT}`);
});
