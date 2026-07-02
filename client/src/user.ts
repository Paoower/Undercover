const KEY = "undercover:userId";

function genId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Persistent per-browser identity. Reuse the same id on another device to
// recover your packs (see setUserId).
export function getUserId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = genId();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function setUserId(id: string): string {
  const clean = id.trim();
  if (clean) localStorage.setItem(KEY, clean);
  return getUserId();
}
