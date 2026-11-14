import { apiFetch } from "./client";
import type { SubscriptionJson } from "@/lib/pwa/push";
import type { User } from "./types";

export const getPushKey = () => apiFetch<{ data: { public_key: string } }>("/push/key").then((r) => r.data.public_key);
export const subscribePush = (subscription: SubscriptionJson) =>
  apiFetch<{ user: User }>("/push/subscriptions", { method: "POST", body: { subscription } }).then((r) => r.user);
export const unsubscribePush = (endpoint: string) =>
  apiFetch<{ user: User }>("/push/subscriptions", { method: "DELETE", body: { endpoint } }).then((r) => r.user);
export const sendTestPush = () => apiFetch<{ data: { sent: number } }>("/push/test", { method: "POST" }).then((r) => r.data.sent);
