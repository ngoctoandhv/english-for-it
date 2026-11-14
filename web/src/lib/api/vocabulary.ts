import { apiFetch } from "./client";
import type { Paginated } from "./types";

export type Category = { id: number; name: string; slug: string; words_count: number };
export type Collection = { id: number; title: string; slug: string; description: string | null; words_count: number };
export type WordSummary = {
  id: number;
  term: string;
  ipa: string | null;
  part_of_speech: string;
  meaning_vi: string;
  definition_en: string;
  audio_url: string | null;
  category: { id: number; name: string; slug: string } | null;
  favorited: boolean;
};
export type WordDetail = WordSummary & {
  examples: { id: number; sentence_en: string; translation_vi: string; audio_url: string | null }[];
  collocations: { id: number; phrase: string; translation_vi: string | null }[];
};

export const getCategories = () => apiFetch<{ data: Category[] }>("/categories").then((r) => r.data);
export const getCollections = () => apiFetch<{ data: Collection[] }>("/collections").then((r) => r.data);

export function getWords(params: { q?: string; category?: string; collection?: string; page?: number }) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
  return apiFetch<Paginated<WordSummary>>(`/words?${qs}`);
}
export const getWord = (id: string | number) => apiFetch<{ data: WordDetail }>(`/words/${id}`).then((r) => r.data);

export const addFavorite = (id: number) => apiFetch<void>("/favorites", { method: "POST", body: { type: "word", id } });
export const removeFavorite = (id: number) => apiFetch<void>(`/favorites/word/${id}`, { method: "DELETE" });
