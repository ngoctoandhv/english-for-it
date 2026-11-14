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

export const startSession = () =>
  apiFetch<{ data: LearningSession | null; reason?: string }>("/learning_sessions", { method: "POST" }).then((r) => r.data);

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
