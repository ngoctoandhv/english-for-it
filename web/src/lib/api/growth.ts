import { apiFetch } from "./client";

export type Growth = {
  xp: number;
  rank: { key: string; index: number; xp: number };
  next_rank: { key: string; index: number; xp: number } | null;
  progress_to_next: number;
  calendar: { date: string; count: number }[];
  week: { active_days: number; target: number; start: string };
  active_days_total: number;
  units_completed: number;
};

export const getGrowth = () => apiFetch<{ data: Growth }>("/growth").then((r) => r.data);
