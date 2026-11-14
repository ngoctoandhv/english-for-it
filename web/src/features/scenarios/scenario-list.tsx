"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { errorMessage } from "@/lib/api/errors";
import { getScenarios, type ScenarioSummary } from "@/lib/api/scenarios";

export function ScenarioList() {
  const [items, setItems] = useState<ScenarioSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScenarios().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Scenarios</h1>
      <p className="mb-6 text-muted-foreground">Practise real workplace conversations, step by step.</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {items?.length === 0 && <p className="text-muted-foreground">No scenarios yet.</p>}
      <ul className="divide-y rounded-lg border">
        {items?.map((s) => (
          <li key={s.id}>
            <Link href={`/scenarios/${s.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
              <span>
                <span className="block font-medium">{s.title}</span>
                <span className="block text-sm text-muted-foreground">{s.description}</span>
              </span>
              <span className="shrink-0 text-right text-sm text-muted-foreground">
                <span className="block capitalize">{s.level}</span>
                {s.completed && <span className="block">Completed</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
