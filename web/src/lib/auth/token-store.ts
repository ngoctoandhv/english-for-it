// Tokens live in localStorage (web). The trade-off (XSS exposure vs. simple mobile-compatible bearer auth)
// is recorded in docs/decisions/002-auth.md.
const KEY = "efit.tokens";

export type Tokens = { accessToken: string; refreshToken: string };

export const tokenStore = {
  get(): Tokens | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  },
  set(tokens: Tokens) {
    try {
      localStorage.setItem(KEY, JSON.stringify(tokens));
    } catch {
      /* storage unavailable: session is memory-only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
