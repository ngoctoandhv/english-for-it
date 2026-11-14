"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { errorMessage } from "@/lib/api/errors";
import { getLessons, type LessonSummary } from "@/lib/api/listening";

export function LessonList() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessons().then(setLessons).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Listening</h1>
      <p className="mb-6 text-muted-foreground">Short workplace dialogues. Listen first, answer, then read the transcript.</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {lessons?.length === 0 && <p className="text-muted-foreground">No lessons yet.</p>}
      <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
        {lessons?.map((l) => (
          <li key={l.id}>
            <Link href={`/listening/${l.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
              <span>
                <span className="block font-medium">{l.title}</span>
                <span className="block text-sm text-muted-foreground">{l.description}</span>
              </span>
              <span className="shrink-0 text-right text-sm text-muted-foreground">
                <span className="block capitalize">{l.level}</span>
                {l.best_score !== null && <span className="block">Best {l.best_score}/{l.questions_count}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
