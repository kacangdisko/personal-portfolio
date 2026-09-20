import { commandLookup } from "@/content/commands";

/** Standard Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  const rows: number[][] = [];
  for (let i = 0; i <= b.length; i++) rows[i] = [i];
  for (let j = 0; j <= a.length; j++) rows[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      rows[i][j] =
        b[i - 1] === a[j - 1]
          ? rows[i - 1][j - 1]
          : Math.min(rows[i - 1][j - 1] + 1, rows[i][j - 1] + 1, rows[i - 1][j] + 1);
    }
  }
  return rows[b.length][a.length];
}

/**
 * Closest command to a typo, or null when nothing is close enough.
 * Distance 3 catches realistic slips ("projcts", "reserch") without
 * suggesting something unrelated for genuine nonsense.
 */
export function nearestCommand(word: string): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;

  for (const key of Object.keys(commandLookup)) {
    const d = levenshtein(word, key);
    if (d < bestDistance) {
      bestDistance = d;
      best = key;
    }
  }

  if (best === null || bestDistance > 3) return null;
  return commandLookup[best].name;
}

/** Tab completion: first command or alias that starts with the typed prefix. */
export function completeCommand(prefix: string): string | null {
  if (!prefix) return null;
  const keys = Object.keys(commandLookup).sort();
  const hit = keys.find((k) => k.startsWith(prefix));
  return hit ? commandLookup[hit].name : null;
}
