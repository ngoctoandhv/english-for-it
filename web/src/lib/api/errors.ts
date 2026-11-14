import { ApiError } from "./client";

type T = (key: string, params?: Record<string, string | number>) => string;
const KNOWN = ["invalid_credentials", "rate_limited", "validation_failed", "unauthorized", "forbidden", "not_found", "invalid_token"];

/** Maps an API error to a message in the user's language. Falls back to the server message, then a generic one. */
export function errorMessage(error: unknown, t?: T): string {
  const tr: T = t ?? ((k) => k);
  if (error instanceof ApiError) {
    if (KNOWN.includes(error.code)) return tr(`error.${error.code}`);
    return error.message;
  }
  return t ? tr("error.generic") : "Something went wrong. Please try again.";
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  return Object.fromEntries(Object.entries(error.details).map(([k, v]) => [k, v.join(", ")]));
}
