import { apiFetch } from "./client";

export type ScenarioSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  lines_count: number;
  last_position: number | null;
  completed: boolean;
};
export type DialogueLine = {
  id: number;
  position: number;
  speaker: string;
  role: "other" | "you";
  text_en: string;
  text_vi: string | null;
  tip: string | null;
  audio_url: string | null;
};
export type ScenarioDetail = ScenarioSummary & { situation: string | null; dialogues: DialogueLine[] };

export const getScenarios = () => apiFetch<{ data: ScenarioSummary[] }>("/scenarios").then((r) => r.data);
export const getScenario = (slug: string) => apiFetch<{ data: ScenarioDetail }>(`/scenarios/${slug}`).then((r) => r.data);
export const saveScenarioProgress = (slug: string, lastPosition: number, completed = false) =>
  apiFetch<{ data: { units_completed?: { slug: string; title: string }[] } }>(`/scenarios/${slug}/progress`, { method: "POST", body: { progress: { last_position: lastPosition, completed } } });
