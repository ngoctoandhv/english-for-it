import { apiFetch } from "./client";

export type Retention = { cohort: number; returned: number; rate: number | null };
export type Metrics = {
  users: { total: number; new_7d: number; new_30d: number };
  active: { today: number; last_7d: number; last_30d: number };
  retention: { day_1: Retention; day_7: Retention };
  funnel: { signed_up: number; onboarded: number; first_review: number; first_unit: number };
  learning_7d: { reviews: number; sessions_started: number; sessions_completed: number; units_completed: number };
  reports: { open: number };
};

export const getMetrics = () => apiFetch<{ data: Metrics }>("/admin/metrics").then((r) => r.data);
export const pingAppOpen = () => apiFetch<void>("/events", { method: "POST", body: { name: "app_open" } });
export type ReportType = "word" | "listening" | "scenario" | "phrase";
export const sendReport = (type: ReportType, id: number, message: string) =>
  apiFetch<void>("/reports", { method: "POST", body: { report: { type, id, message } } });
