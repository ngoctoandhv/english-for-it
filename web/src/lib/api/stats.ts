import { apiFetch } from "./client";
import type { Paginated } from "./types";

export type Dashboard = {
  due_count: number;
  new_available: number;
  goal_cards: number;
  backlog: boolean;
  can_start: boolean;
  open_session: { id: number; status: string; total_items: number; completed_items: number } | null;
  reviewed_today: number;
  days_studied_this_week: number;
  words_started: number;
  favorites_count: number;
};

export type ProgressSummary = {
  words: { started: number; learning: number; young: number; mature: number };
  reviews: { total: number; accuracy: number | null };
  by_day: { date: string; reviews: number }[];
};

export type HistoryItem = { id: number; rating: string; reviewed_at: string; word: { id: number; term: string; meaning_vi: string } };

export const getDashboard = () => apiFetch<{ data: Dashboard }>("/dashboard").then((r) => r.data);
export const getProgress = () => apiFetch<{ data: ProgressSummary }>("/progress").then((r) => r.data);
export const getHistory = (page: number) => apiFetch<Paginated<HistoryItem>>(`/history?page=${page}&per_page=20`);

export type QuizMode = "choice" | "listen" | "type";
export type QuizQuestion =
  | { mode: "choice"; word_id: number; term: string; ipa: string | null; part_of_speech: string; options: { word_id: number; meaning_vi: string }[] }
  | { mode: "listen"; word_id: number; audio_url: string | null; speak_text: string | null; options: { word_id: number; term: string }[] }
  | { mode: "type"; word_id: number; definition_en: string; meaning_vi: string; part_of_speech: string; length: number; first_letter: string };
export type QuizAnswer = { word_id: number; choice_word_id?: number; text?: string };
export type QuizResult = {
  score: number;
  total: number;
  results: { word_id: number; correct: boolean; close: boolean; correct_term: string; correct_meaning_vi: string }[];
};

export const getQuickQuiz = (mode: QuizMode, count = 5) =>
  apiFetch<{ data: { questions: QuizQuestion[] } }>(`/quizzes/quick?mode=${mode}&count=${count}`).then((r) => r.data.questions);
export const answerQuiz = (answers: QuizAnswer[]) =>
  apiFetch<{ data: QuizResult }>("/quizzes/quick/answers", { method: "POST", body: { answers } }).then((r) => r.data);
