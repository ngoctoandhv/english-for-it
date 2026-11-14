import { apiFetch } from "./client";

export type Health = { status: string; database: boolean };

export const getHealth = () => apiFetch<Health>("/health", { auth: false });
