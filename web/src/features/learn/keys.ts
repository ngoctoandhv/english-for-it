import type { Rating } from "@/lib/api/learning";

export const RATINGS: { rating: Rating; key: string }[] = [
  { rating: "again", key: "1" },
  { rating: "hard", key: "2" },
  { rating: "good", key: "3" },
  { rating: "easy", key: "4" },
];

export type KeyAction = { type: "reveal" } | { type: "rate"; rating: Rating } | { type: "play" } | null;

/** Maps a keyboard key to a flashcard action. Ratings only work once the answer is revealed. */
export function actionForKey(key: string, revealed: boolean): KeyAction {
  if (key === "p" || key === "P") return { type: "play" };
  if (!revealed) return key === " " || key === "Enter" ? { type: "reveal" } : null;
  const match = RATINGS.find((r) => r.key === key);
  if (match) return { type: "rate", rating: match.rating };
  if (key === " " || key === "Enter") return { type: "rate", rating: "good" };
  return null;
}
