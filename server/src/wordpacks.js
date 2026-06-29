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

export function listPacks() {
  return packs.map((p) => ({
    id: p.id,
    name: p.name,
    theme: p.theme || "",
    count: p.pairs.length,
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

// Create or update a pack. If id is provided and exists -> update, else create.
export function savePack({ id, name, theme, pairs }) {
  const cleanPairs = normalizePairs(pairs);
  const cleanName = String(name || "").trim() || "Pack sans nom";
  const cleanTheme = String(theme || "").trim();

  if (id) {
    const existing = packs.find((p) => p.id === id);
    if (existing) {
      existing.name = cleanName;
      existing.theme = cleanTheme;
      existing.pairs = cleanPairs;
      persist();
      return existing;
    }
  }
  const newPack = {
    id: id || nanoid(8),
    name: cleanName,
    theme: cleanTheme,
    pairs: cleanPairs,
  };
  packs.push(newPack);
  persist();
  return newPack;
}

export function deletePack(id) {
  const before = packs.length;
  packs = packs.filter((p) => p.id !== id);
  if (packs.length !== before) persist();
  return packs.length !== before;
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
