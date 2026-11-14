import { apiFetch } from "./client";

export type PhraseCategory = "pr_feedback" | "standup" | "meeting" | "incident" | "email";
export type Phrase = { id: number; category: PhraseCategory; text_en: string; text_vi: string; audio_url: string | null };

export const PHRASE_CATEGORIES: PhraseCategory[] = ["pr_feedback", "standup", "meeting", "incident", "email"];
export const getPhrases = (category?: PhraseCategory) =>
  apiFetch<{ data: Phrase[] }>(`/toolkit/phrases${category ? `?category=${category}` : ""}`).then((r) => r.data);
