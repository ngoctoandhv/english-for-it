import { apiFetch } from "./client";

export type LessonSummary = {
  id: number;
  title: string;
  description: string | null;
  level: string;
  duration_seconds: number | null;
  audio_url: string | null;
  questions_count: number;
  best_score: number | null;
};
export type LessonDetail = LessonSummary & {
  transcript_en: string;
  transcript_vi: string | null;
  questions: { id: number; prompt: string; choices: string[] }[];
};
export type AttemptResult = {
  score: number;
  total: number;
  results: { question_id: number; correct: boolean; choice_index: number | null; correct_index: number; explanation: string | null }[];
};

export const getLessons = () => apiFetch<{ data: LessonSummary[] }>("/listening_lessons").then((r) => r.data);
export const getLesson = (id: string) => apiFetch<{ data: LessonDetail }>(`/listening_lessons/${id}`).then((r) => r.data);
export const submitAttempt = (id: number, answers: { question_id: number; choice_index: number }[]) =>
  apiFetch<{ data: AttemptResult }>(`/listening_lessons/${id}/attempts`, { method: "POST", body: { answers } }).then((r) => r.data);
