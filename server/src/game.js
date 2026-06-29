import { randomPairFromPacks } from "./wordpacks.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function alivePlayers(room) {
  return [...room.players.values()].filter((p) => p.alive);
}

// Assign roles + words and start the first clue round.
export function startGame(room) {
  const players = [...room.players.values()];
  if (players.length < 3) {
    return { error: "Il faut au moins 3 joueurs pour démarrer" };
  }

  const cfg = room.config;
  const cluesPerPlayer = Math.max(1, cfg.cluesPerPlayer || 2);
  const wantMisterWhite = cfg.misterWhiteEnabled ? 1 : 0;
  const numImpostors = Math.max(1, Math.min(cfg.numImpostors, players.length - 2));

  if (numImpostors + wantMisterWhite >= players.length) {
    return { error: "Trop d'imposteurs/Mister White par rapport au nombre de joueurs" };
  }

  const pair = randomPairFromPacks(cfg.wordpackIds);
  if (!pair) return { error: "Aucun pack sélectionné (ou packs vides)" };

  room.civilWord = pair.civil;
  room.impostorWord = pair.imposteur;

  // Shuffle players and assign special roles.
  const shuffled = shuffle(players);
  const roles = {};
  let idx = 0;
  for (let i = 0; i < numImpostors; i++) roles[shuffled[idx++].id] = "impostor";
  if (wantMisterWhite) roles[shuffled[idx++].id] = "misterwhite";

  for (const p of players) {
    p.alive = true;
    p.clues = [];
    p.votedFor = null;
    const role = roles[p.id] || "civil";
    p.role = role;
    if (role === "civil") p.word = room.civilWord;
    else if (role === "impostor") p.word = room.impostorWord;
    else p.word = null; // Mister White: blank card
  }

  room.phase = "playing";
  room.round = 1;
  room.votes = {};
  room.lastEliminated = null;
  room.misterWhiteGuessPending = null;
  room.winner = null;
  room.winReason = null;
  buildTurnOrder(room);
  return { ok: true };
}

// Build the turn sequence for a round: each alive player speaks `cluesPerPlayer`
// times, cycling through the same shuffled order.
function buildTurnOrder(room) {
  const cluesPerPlayer = Math.max(1, room.config.cluesPerPlayer || 2);
  const base = shuffle(alivePlayers(room).map((p) => p.id));
  room.baseOrder = base;
  room.turnOrder = [];
  for (let c = 0; c < cluesPerPlayer; c++) room.turnOrder.push(...base);
  room.currentTurnIndex = 0;
  room.wordNumber = 1;
}

export function currentTurnPlayerId(room) {
  return room.turnOrder[room.currentTurnIndex] || null;
}

export function submitClue(room, playerId, clue) {
  if (room.phase !== "playing") return { error: "Ce n'est pas la phase de jeu" };
  const turnId = currentTurnPlayerId(room);
  if (turnId !== playerId) return { error: "Ce n'est pas votre tour" };
  const player = room.players.get(playerId);
  if (!player || !player.alive) return { error: "Vous ne pouvez pas jouer" };

  const text = String(clue || "").trim();
  if (!text) return { error: "Mot-clé vide" };

  player.clues.push(text);

  // Advance to next player in turn order.
  room.currentTurnIndex++;
  const base = room.baseOrder.length || 1;
  room.wordNumber = Math.min(
    Math.floor(room.currentTurnIndex / base) + 1,
    room.config.cluesPerPlayer || 2
  );

  // Everyone gave the configured number of clues -> auto-start voting.
  if (room.currentTurnIndex >= room.turnOrder.length) {
    goToVote(room);
    return { ok: true, autoVote: true };
  }
  return { ok: true };
}

export function goToVote(room) {
  if (room.phase !== "playing") return { error: "Impossible de passer aux votes maintenant" };
  room.phase = "voting";
  room.votes = {};
  for (const p of room.players.values()) p.votedFor = null;
  return { ok: true };
}

export function castVote(room, voterId, targetId) {
  if (room.phase !== "voting") return { error: "Ce n'est pas la phase de vote" };
  const voter = room.players.get(voterId);
  if (!voter || !voter.alive) return { error: "Vous ne pouvez pas voter" };
  const target = room.players.get(targetId);
  if (!target || !target.alive) return { error: "Cible invalide" };

  voter.votedFor = targetId;
  room.votes[voterId] = targetId;

  const aliveCount = alivePlayers(room).length;
  const votesCast = Object.keys(room.votes).length;
  const allVoted = votesCast >= aliveCount;
  return { ok: true, allVoted };
}

// Tally votes, eliminate the most-voted player, reveal role, check win/MW.
export function resolveVotes(room) {
  if (room.phase !== "voting") return { error: "Pas en phase de vote" };

  const counts = {};
  for (const targetId of Object.values(room.votes)) {
    counts[targetId] = (counts[targetId] || 0) + 1;
  }

  let eliminatedId = null;
  if (Object.keys(counts).length > 0) {
    const max = Math.max(...Object.values(counts));
    const top = Object.keys(counts).filter((id) => counts[id] === max);
    // Tie -> random among the top to keep the game moving.
    eliminatedId = top[Math.floor(Math.random() * top.length)];
  }

  if (!eliminatedId) {
    // Nobody voted: no elimination, proceed to next round.
    room.lastEliminated = null;
    room.phase = "reveal";
    return { ok: true, eliminated: null };
  }

  const eliminated = room.players.get(eliminatedId);
  eliminated.alive = false;
  room.lastEliminated = {
    id: eliminated.id,
    pseudo: eliminated.pseudo,
    avatar: eliminated.avatar,
    role: eliminated.role,
  };
  room.phase = "reveal";

  // Mister White eliminated -> gets one guess.
  if (eliminated.role === "misterwhite") {
    room.phase = "misterwhite";
    room.misterWhiteGuessPending = eliminated.id;
    return { ok: true, eliminated: room.lastEliminated, misterWhite: true };
  }

  return { ok: true, eliminated: room.lastEliminated };
}

// Mister White's single guess. Correct guess -> bad camp wins.
export function misterWhiteGuess(room, playerId, guess) {
  if (room.phase !== "misterwhite") return { error: "Pas de devinette en attente" };
  if (room.misterWhiteGuessPending !== playerId) return { error: "Ce n'est pas à vous de deviner" };

  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const correct = normalize(guess) === normalize(room.civilWord);
  room.misterWhiteGuessPending = null;

  if (correct) {
    room.phase = "ended";
    room.winner = "impostors";
    room.winReason = "Mister White a deviné le mot des civils !";
    return { ok: true, correct: true };
  }
  room.phase = "reveal";
  return { ok: true, correct: false };
}

// Returns winner info if the game is decided, else null.
export function checkWin(room) {
  const alive = alivePlayers(room);
  const aliveImpostors = alive.filter((p) => p.role === "impostor").length;
  const aliveMisterWhite = alive.filter((p) => p.role === "misterwhite").length;
  const aliveCivils = alive.filter((p) => p.role === "civil").length;
  const aliveBad = aliveImpostors + aliveMisterWhite;

  if (aliveBad === 0) {
    return { winner: "civils", reason: "Tous les imposteurs ont été éliminés !" };
  }
  if (aliveBad >= aliveCivils) {
    return {
      winner: "impostors",
      reason: "Les imposteurs ont pris la majorité !",
    };
  }
  return null;
}

// Advance from reveal to the next clue round, or end the game.
export function nextRound(room) {
  const win = checkWin(room);
  if (win) {
    room.phase = "ended";
    room.winner = win.winner;
    room.winReason = win.reason;
    return { ok: true, ended: true };
  }

  room.round++;
  room.phase = "playing";
  room.votes = {};
  for (const p of room.players.values()) p.votedFor = null;
  buildTurnOrder(room);
  return { ok: true, ended: false };
}

export function restartGame(room) {
  room.phase = "lobby";
  room.round = 0;
  room.civilWord = null;
  room.impostorWord = null;
  room.turnOrder = [];
  room.currentTurnIndex = 0;
  room.votes = {};
  room.lastEliminated = null;
  room.misterWhiteGuessPending = null;
  room.winner = null;
  room.winReason = null;
  for (const p of room.players.values()) {
    p.role = null;
    p.word = null;
    p.alive = true;
    p.clues = [];
    p.votedFor = null;
  }
  return { ok: true };
}
