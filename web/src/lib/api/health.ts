import { apiFetch } from "./client";

export type Health = { status: string; database: boolean; redis: boolean };

export const getHealth = () => apiFetch<Health>("/health");
