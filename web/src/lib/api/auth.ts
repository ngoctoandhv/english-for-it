import { apiFetch } from "./client";
import type { FocusGoal, FocusRole, User } from "./types";

export type AuthResponse = { user: User; access_token: string; refresh_token: string; expires_in: number };

export const register = (input: { email: string; password: string; name: string; time_zone: string }) =>
  apiFetch<AuthResponse>("/auth/register", { method: "POST", auth: false, body: { user: input } });

export const login = (input: { email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/login", { method: "POST", auth: false, body: { user: input } });

export const logout = (refreshToken: string) =>
  apiFetch<void>("/auth/logout", { method: "DELETE", auth: false, body: { refresh_token: refreshToken } });

export const getMe = () => apiFetch<{ user: User }>("/me");

export const completeOnboarding = (input: { level: string; daily_goal_minutes: number; time_zone: string; focus_role?: FocusRole; focus_goal?: FocusGoal; reminder_hour?: number }) =>
  apiFetch<{ user: User }>("/me/onboarding", { method: "POST", body: { user: input } });

export const updateMe = (input: { name?: string; level?: string; daily_goal_minutes?: number; focus_role?: FocusRole; focus_goal?: FocusGoal; reminder_hour?: number }) =>
  apiFetch<{ user: User }>("/me", { method: "PATCH", body: { user: input } });
export const forgotPassword = (email: string) => apiFetch<void>("/auth/password/forgot", { method: "POST", auth: false, body: { email } });
export const resetPassword = (token: string, password: string) =>
  apiFetch<void>("/auth/password/reset", { method: "POST", auth: false, body: { token, password } });
export const verifyEmail = (token: string) => apiFetch<void>("/auth/email/verify", { method: "POST", auth: false, body: { token } });
export const resendVerification = () => apiFetch<void>("/me/email/resend", { method: "POST" });
export const changePassword = (current_password: string, new_password: string) =>
  apiFetch<void>("/me/password", { method: "PATCH", body: { user: { current_password, new_password } } });
export const exportMyData = () => apiFetch<Record<string, unknown>>("/me/export");
export const deleteAccount = (password: string) => apiFetch<void>("/me", { method: "DELETE", body: { password } });
