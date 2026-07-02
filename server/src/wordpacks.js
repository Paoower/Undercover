import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "..", "data", "wordpacks.json");

let packs = [];

function load() {
  if (existsSync(DATA_FILE)) {
    try {
      packs = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
    } catch (e) {
      console.error("Failed to parse wordpacks.json, starting empty", e);
      packs = [];
    }
  }
}

function persist() {
  writeFileSync(DATA_FILE, JSON.stringify(packs, null, 2), "utf-8");
}

load();

// Packs without an ownerId are shared (built-ins): visible to everyone.
// Packs with an ownerId are private to that user.
export function listPacks(userId) {
  return packs
    .filter((p) => !p.ownerId || p.ownerId === userId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      theme: p.theme || "",
      count: p.pairs.length,
      owned: !!userId && p.ownerId === userId,
      shared: !p.ownerId,
    }));
}

export function getPack(id) {
  return packs.find((p) => p.id === id) || null;
}

function normalizePairs(pairs) {
  return (pairs || [])
    .map((p) => ({
      civil: String(p.civil || "").trim(),
      imposteur: String(p.imposteur || "").trim(),
    }))
    .filter((p) => p.civil && p.imposteur);
}

// Create or update a pack.
// - Updating in place is only allowed on a pack the user owns.
// - Saving a shared/built-in pack (or someone else's) creates a private copy.
export function savePack({ id, name, theme, pairs }, userId) {
  const cleanPairs = normalizePairs(pairs);
  const cleanName = String(name || "").trim() || "Pack sans nom";
  const cleanTheme = String(theme || "").trim();
  const uid = userId || null;

  if (id) {
    const existing = packs.find((p) => p.id === id);
    if (existing && existing.ownerId && existing.ownerId === uid) {
      existing.name = cleanName;
      existing.theme = cleanTheme;
      existing.pairs = cleanPairs;
      persist();
      return existing;
    }
  }
  const newPack = {
    id: nanoid(8),
    name: cleanName,
    theme: cleanTheme,
    pairs: cleanPairs,
    ownerId: uid,
  };
  packs.push(newPack);
  persist();
  return newPack;
}

// Only the owner can delete; shared/built-in packs are protected.
export function deletePack(id, userId) {
  const pack = packs.find((p) => p.id === id);
  if (!pack || !pack.ownerId || pack.ownerId !== userId) return false;
  packs = packs.filter((p) => p.id !== id);
  persist();
  return true;
}

// Parse bulk text: one pair per line, separator "|" or ",".
export function parseBulk(text) {
  const lines = String(text || "").split(/\r?\n/);
  const pairs = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.includes("|") ? trimmed.split("|") : trimmed.split(",");
    if (parts.length < 2) continue;
    const civil = parts[0].trim();
    const imposteur = parts[1].trim();
    if (civil && imposteur) pairs.push({ civil, imposteur });
  }
  return pairs;
}

export function randomPair(packId) {
  const pack = getPack(packId) || packs[0];
  if (!pack || pack.pairs.length === 0) return null;
  return pack.pairs[Math.floor(Math.random() * pack.pairs.length)];
}

// Pick a random pair from the union of the selected packs.
export function randomPairFromPacks(packIds) {
  const ids = Array.isArray(packIds) ? packIds : [packIds];
  const pool = [];
  for (const id of ids) {
    const pack = getPack(id);
    if (pack) pool.push(...pack.pairs);
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function defaultPackIds() {
  return packs.length ? [packs[0].id] : [];
}
