/** Compares what a learner said (a speech-recognition transcript) with the line they meant to say. Pure and testable. */

const CONTRACTIONS: Record<string, string[]> = {
  "i'm": ["i", "am"], "it's": ["it", "is"], "that's": ["that", "is"], "there's": ["there", "is"], "let's": ["let", "us"],
  "don't": ["do", "not"], "doesn't": ["does", "not"], "didn't": ["did", "not"], "can't": ["can", "not"], cannot: ["can", "not"],
  "won't": ["will", "not"], "isn't": ["is", "not"], "haven't": ["have", "not"], "couldn't": ["could", "not"],
  "i'll": ["i", "will"], "i've": ["i", "have"], "we're": ["we", "are"], "you're": ["you", "are"], "they're": ["they", "are"],
};

function normalise(word: string): string[] {
  const w = word.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, "").replace(/^'+|'+$/g, "");
  if (!w) return [];
  return CONTRACTIONS[w] ?? [w.replace(/'/g, "")];
}

export type SpokenWord = { word: string; ok: boolean };
export type SpeechComparison = { score: number; words: SpokenWord[]; extra: string[] };

export function compareSpeech(target: string, heard: string): SpeechComparison {
  const units = target.split(/\s+/).filter(Boolean).map((word) => ({ word, tokens: normalise(word) }));
  const flat = units.flatMap((u, unit) => u.tokens.map((token) => ({ token, unit })));
  const said = heard.split(/\s+/).flatMap((w) => normalise(w).map((token) => ({ token, raw: w })));

  // Longest common subsequence of tokens, so a repeated or skipped word does not shift everything after it.
  const n = flat.length;
  const m = said.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = flat[i].token === said[j].token ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const hit = new Set<number>();
  const used = new Set<number>();
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (flat[i].token === said[j].token) {
      hit.add(i);
      used.add(j);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }

  const missed = new Set<number>();
  flat.forEach((f, i) => !hit.has(i) && missed.add(f.unit));
  const words = units.map((u, i) => ({ word: u.word, ok: u.tokens.length > 0 && !missed.has(i) }));
  const extra = said.filter((_, j) => !used.has(j)).map((s) => s.raw.replace(/[^\p{L}\p{N}']/gu, "")).filter(Boolean);
  return { score: n === 0 ? 0 : Math.round((hit.size * 100) / n), words, extra };
}
