"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { getLesson, submitAttempt, type AttemptResult, type LessonDetail } from "@/lib/api/listening";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25];

export function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    getLesson(id).then(setLesson).catch((e) => setError(errorMessage(e)));
  }, [id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, lesson]);

  async function submit() {
    if (!lesson) return;
    setBusy(true);
    setError(null);
    try {
      const body = Object.entries(answers).map(([q, c]) => ({ question_id: Number(q), choice_index: c }));
      setResult(await submitAttempt(lesson.id, body));
      setShowTranscript(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function speak() {
    if (!lesson || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lesson.transcript_en.replace(/^[^:\n]+:\s*/gm, ""));
    u.lang = "en-US";
    u.rate = speed;
    window.speechSynthesis.speak(u);
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <AppShell>
      <Link href="/listening" className="text-sm text-muted-foreground underline underline-offset-4">← Listening</Link>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {lesson && (
        <div className="mt-4 max-w-2xl space-y-8">
          <header className="space-y-1">
            <h1 className="text-4xl leading-tight">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </header>

          <section aria-label="Audio" className="space-y-3">
            {lesson.audio_url ? (
              <audio ref={audioRef} controls src={lesson.audio_url} className="w-full" />
            ) : (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Button onClick={speak}>Play with browser voice</Button>
                <span className="text-sm text-muted-foreground">No recording yet.</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm" role="group" aria-label="Playback speed">
              <span className="text-muted-foreground">Speed</span>
              {SPEEDS.map((s) => (
                <Button key={s} size="sm" variant={speed === s ? "default" : "outline"} aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                  {s}×
                </Button>
              ))}
            </div>
          </section>

          <section aria-label="Questions" className="space-y-6">
            {lesson.questions.map((q, qi) => {
              const r = result?.results.find((x) => x.question_id === q.id);
              return (
                <fieldset key={q.id} className="space-y-2" disabled={!!result}>
                  <legend className="mb-2 font-medium">{qi + 1}. {q.prompt}</legend>
                  {q.choices.map((c, ci) => {
                    const picked = answers[q.id] === ci;
                    return (
                      <label
                        key={ci}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          picked && !result && "border-primary bg-muted",
                          r && ci === r.correct_index && "border-green-600 bg-green-50 dark:bg-green-950/30",
                          r && picked && !r.correct && "border-destructive bg-destructive/10",
                        )}
                      >
                        <input type="radio" name={`q-${q.id}`} checked={picked} onChange={() => setAnswers((a) => ({ ...a, [q.id]: ci }))} />
                        {c}
                        {r && ci === r.correct_index && <span className="sr-only"> (correct answer)</span>}
                      </label>
                    );
                  })}
                  {r?.explanation && <p className="text-sm text-muted-foreground">{r.explanation}</p>}
                </fieldset>
              );
            })}
            {!result ? (
              <Button size="lg" onClick={submit} disabled={busy || Object.keys(answers).length === 0}>
                {busy ? "Checking…" : "Check answers"}
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <p role="status" data-testid="listening-score" className="text-xl font-medium">{result.score} / {result.total}</p>
                <Button variant="outline" onClick={retry}>Try again</Button>
              </div>
            )}
          </section>

          <section aria-label="Transcript" className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
                {showTranscript ? "Hide transcript" : "Show transcript"}
              </Button>
              {showTranscript && lesson.transcript_vi && (
                <Button variant="outline" onClick={() => setShowVi((v) => !v)} aria-pressed={showVi}>
                  Vietnamese
                </Button>
              )}
            </div>
            {showTranscript && (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="whitespace-pre-line">{lesson.transcript_en}</p>
                {showVi && <p className="whitespace-pre-line border-t pt-4 text-muted-foreground">{lesson.transcript_vi}</p>}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
