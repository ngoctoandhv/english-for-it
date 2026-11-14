import { apiFetch } from "./client";
import type { WordDetail } from "./vocabulary";

export type Rating = "again" | "hard" | "good" | "easy";

export type SessionItem = { id: number; kind: "new" | "review"; position: number; completed: boolean; word: WordDetail };
export type LearningSession = {
  id: number;
  status: "in_progress" | "completed";
  total_items: number;
  completed_items: number;
  items: SessionItem[];
};

/** extra: a session of that many new words only, on top of the daily plan (5, 10, 20 or 30). */
export const startSession = (collection?: string, extra?: number) => {
  const qs = new URLSearchParams();
  if (collection) qs.set("collection", collection);
  if (extra) qs.set("extra", String(extra));
  const q = qs.toString();
  return apiFetch<{ data: LearningSession | null; reason?: string }>(`/learning_sessions${q ? `?${q}` : ""}`, { method: "POST" }).then((r) => r.data);
};
export const EXTRA_SIZES = [5, 10, 20, 30] as const;

export const completeSession = (id: number) => apiFetch<unknown>(`/learning_sessions/${id}/complete`, { method: "POST" });

export type ReviewResult = {
  data: {
    review: { id: number; rating: Rating };
    progress: { state: string; due_at: string; interval_days: number; reps: number } | null;
    session: { id: number; status: string; total_items: number; completed_items: number } | null;
  };
  duplicate: boolean;
};

export const submitReview = (input: { word_id: number; rating: Rating; client_request_id: string; session_item_id?: number }) =>
  apiFetch<ReviewResult>("/reviews", { method: "POST", body: { review: input } });
