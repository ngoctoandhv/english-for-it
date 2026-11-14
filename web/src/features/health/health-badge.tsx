"use client";

import { useHealth } from "./use-health";

export function HealthBadge() {
  const state = useHealth();
  const text =
    state.kind === "loading"
      ? "Checking API…"
      : state.kind === "error"
        ? `API unreachable: ${state.message}`
        : `API ${state.health.status} · database ${state.health.database ? "up" : "down"}`;

  return (
    <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
      {text}
    </p>
  );
}
