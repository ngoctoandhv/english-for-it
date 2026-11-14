import { ApiError } from "./client";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  rate_limited: "Too many attempts. Please wait a minute and try again.",
  validation_failed: "Please check the highlighted fields.",
  unauthorized: "Please sign in again.",
  forbidden: "You don't have access to this.",
  not_found: "We couldn't find that.",
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return MESSAGES[error.code] ?? error.message;
  return "Something went wrong. Please try again.";
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  return Object.fromEntries(Object.entries(error.details).map(([k, v]) => [k, v.join(", ")]));
}
