import { apiFetch } from "./client";

export type StepKind = "words" | "listening" | "scenario" | "quiz";
export type PathStep = {
  id: number;
  kind: StepKind;
  title: string | null;
  done: number;
  total: number;
  complete: boolean;
  target: { collection?: string; lesson_id?: number; scenario?: string; unit?: string };
};
export type UnitStatus = "completed" | "in_progress" | "available" | "locked";
export type PathUnit = {
  slug: string;
  title: string;
  description: string | null;
  level: "elementary" | "intermediate";
  status: UnitStatus;
  recommended: boolean;
  steps_done: number;
  steps_total: number;
  steps: PathStep[];
  next_step: PathStep | null;
};
export type PathOverview = {
  start_level: string;
  levels: { level: "elementary" | "intermediate"; units: PathUnit[] }[];
  next_up: { unit: string; unit_title: string; step: PathStep | null; steps_done: number; steps_total: number } | null;
};

export const getPath = () => apiFetch<{ data: PathOverview }>("/path").then((r) => r.data);
export const getUnit = (slug: string) => apiFetch<{ data: PathUnit }>(`/path/units/${slug}`).then((r) => r.data);

/** Where a step lives in the app. */
export function stepHref(step: PathStep, unitSlug: string): string {
  switch (step.kind) {
    case "words":
      return `/learn?collection=${step.target.collection}`;
    case "listening":
      return `/listening/${step.target.lesson_id}`;
    case "scenario":
      return `/scenarios/${step.target.scenario}`;
    default:
      return `/path/${unitSlug}/quiz`;
  }
}

export type UnitQuizQuestion = { word_id: number; term: string; ipa: string | null; part_of_speech: string; options: { word_id: number; meaning_vi: string }[] };
export type UnitQuizResult = {
  score: number;
  total: number;
  saved: boolean;
  passed?: boolean;
  results: { word_id: number; correct: boolean; correct_term: string; correct_meaning_vi: string }[];
  units_completed?: { slug: string; title: string }[];
  xp_gained?: number;
  rank_up?: { key: string; index: number } | null;
};

export const getUnitQuiz = (slug: string) => apiFetch<{ data: { questions: UnitQuizQuestion[] } }>(`/path/units/${slug}/quiz`).then((r) => r.data.questions);
export const answerUnitQuiz = (slug: string, answers: { word_id: number; choice_word_id: number }[]) =>
  apiFetch<{ data: UnitQuizResult }>(`/path/units/${slug}/quiz/answers`, { method: "POST", body: { answers } }).then((r) => r.data);
