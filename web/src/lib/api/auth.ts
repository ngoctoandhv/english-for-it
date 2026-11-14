import { apiFetch } from "./client";
import type { User } from "./types";

export type AuthResponse = { user: User; access_token: string; refresh_token: string; expires_in: number };

export const register = (input: { email: string; password: string; name: string; time_zone: string }) =>
  apiFetch<AuthResponse>("/auth/register", { method: "POST", auth: false, body: { user: input } });

export const login = (input: { email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/login", { method: "POST", auth: false, body: { user: input } });

export const logout = (refreshToken: string) =>
  apiFetch<void>("/auth/logout", { method: "DELETE", auth: false, body: { refresh_token: refreshToken } });

export const getMe = () => apiFetch<{ user: User }>("/me");

export const completeOnboarding = (input: { level: string; daily_goal_minutes: number; time_zone: string }) =>
  apiFetch<{ user: User }>("/me/onboarding", { method: "POST", body: { user: input } });
