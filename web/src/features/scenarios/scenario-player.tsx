"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { getScenario, saveScenarioProgress, type ScenarioDetail } from "@/lib/api/scenarios";
import { cn } from "@/lib/utils";

export function ScenarioPlayer() {
  const { slug } = useParams<{ slug: string }>();
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [step, setStep] = useState(0); // index of the line currently shown (all earlier lines are visible)
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showVi, setShowVi] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getScenario(slug)
      .then((s) => {
        setScenario(s);
        if (s.last_position && !s.completed) setStep(Math.min(s.last_position, s.dialogues.length - 1));
      })
      .catch((e) => setError(errorMessage(e)));
  }, [slug]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [step, revealed]);

  if (error) return <AppShell><p role="alert" className="text-destructive">{error}</p></AppShell>;
  if (!scenario) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;

  const lines = scenario.dialogues;
  const current = lines[step];
  const isLast = step === lines.length - 1;
  const canAdvance = current && (current.role === "other" || revealed[current.id]);

  async function next() {
    try {
      if (isLast) {
        await saveScenarioProgress(slug, step, true);
        setFinished(true);
      } else {
        await saveScenarioProgress(slug, step + 1);
        setStep(step + 1);
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <AppShell>
      <Link href="/scenarios" className="text-sm text-muted-foreground underline underline-offset-4">← Scenarios</Link>
      <div className="mt-4 max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-4xl leading-tight">{scenario.title}</h1>
          {scenario.situation && <p className="text-muted-foreground">{scenario.situation}</p>}
        </header>

        {finished ? (
          <section className="space-y-4">
            <p className="text-xl font-medium">Nice work. Scenario complete.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setFinished(false); setStep(0); setRevealed({}); }}>Practise again</Button>
              <Link href="/scenarios" className={buttonVariants()}>More scenarios</Link>
            </div>
          </section>
        ) : (
          <>
            <ol className="space-y-3" aria-label="Conversation">
              {lines.slice(0, step + 1).map((l, i) => {
                const mine = l.role === "you";
                const hidden = mine && !revealed[l.id];
                return (
                  <li key={l.id} className={cn("max-w-[85%] rounded-lg border p-3", mine ? "ml-auto bg-muted" : "mr-auto")} data-testid={`line-${i}`}>
                    <p className="mb-1 text-xs text-muted-foreground">{l.speaker}</p>
                    {hidden ? (
                      <p className="text-muted-foreground">
                        Your turn. Say it in English: <span className="italic">{l.text_vi}</span>
                      </p>
                    ) : (
                      <>
                        <p className="flex items-start gap-2">
                          <span className="flex-1">{l.text_en}</span>
                          <Button variant="ghost" size="xs" aria-label="Play line" onClick={() => playWord(l.text_en, l.audio_url)}><Play aria-hidden /></Button>
                        </p>
                        {showVi && l.text_vi && <p className="mt-1 text-sm text-muted-foreground">{l.text_vi}</p>}
                        {mine && l.tip && <p className="mt-2 border-t pt-2 text-sm">Tip: {l.tip}</p>}
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
            <div ref={endRef} />

            <div className="flex flex-wrap items-center gap-2">
              {current?.role === "you" && !revealed[current.id] && (
                <Button onClick={() => setRevealed((r) => ({ ...r, [current.id]: true }))}>Show my line</Button>
              )}
              {canAdvance && <Button onClick={next}>{isLast ? "Finish" : "Continue"}</Button>}
              <Button variant="outline" aria-pressed={showVi} onClick={() => setShowVi((v) => !v)}>Vietnamese</Button>
              <span className="ml-auto text-sm text-muted-foreground">{step + 1} / {lines.length}</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
