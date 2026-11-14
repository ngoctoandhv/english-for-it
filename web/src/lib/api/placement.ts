import type { CefrLevel } from "@/lib/cefr";
import { apiFetch } from "./client";
import type { QuizQuestion } from "./stats";

export type PlacementQuestion = Extract<QuizQuestion, { mode: "choice" }> & { level: CefrLevel };
export type PlacementResult = { score: number; total: number; suggested_level: CefrLevel; by_level: Record<CefrLevel, { correct: number; total: number }> };

export const getPlacement = () => apiFetch<{ data: { questions: PlacementQuestion[] } }>("/placement").then((r) => r.data.questions);
export const submitPlacement = (answers: { word_id: number; choice_word_id: number }[]) =>
  apiFetch<{ data: PlacementResult }>("/placement/answers", { method: "POST", body: { answers } }).then((r) => r.data);
