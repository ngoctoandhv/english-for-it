import { apiFetch } from "./client";
import type { Paginated } from "./types";

export type AdminRecord = { id: number } & Record<string, unknown>;

export const adminList = (path: string, params: Record<string, string | number> = {}) => {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  return apiFetch<Paginated<AdminRecord>>(`/admin/${path}?${qs}`);
};
export const adminGet = (path: string, id: string | number) => apiFetch<{ data: AdminRecord }>(`/admin/${path}/${id}`).then((r) => r.data);
export const adminSave = (path: string, id: string | number | null, body: unknown) =>
  apiFetch<{ data: AdminRecord }>(`/admin/${path}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body }).then((r) => r.data);
export const adminDelete = (path: string, id: string | number) => apiFetch<void>(`/admin/${path}/${id}`, { method: "DELETE" });
export const adminUploadAudio = (path: string, id: string | number, file: File) => {
  const form = new FormData();
  form.append("audio", file);
  return apiFetch<{ data: AdminRecord }>(`/admin/${path}/${id}/audio`, { method: "POST", body: form }).then((r) => r.data);
};
export const adminRemoveAudio = (path: string, id: string | number) =>
  apiFetch<{ data: AdminRecord }>(`/admin/${path}/${id}/audio`, { method: "DELETE" }).then((r) => r.data);

export type ImportResult = { created: number; updated: number; errors: { row: number; message: string }[]; dry_run: boolean };
export const importWords = (csv: string, dryRun: boolean) =>
  apiFetch<{ data: ImportResult }>("/admin/words/import", { method: "POST", body: { csv, dry_run: dryRun } }).then((r) => r.data);
