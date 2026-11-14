"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { getLesson, submitAttempt, type AttemptResult, type LessonDetail } from "@/lib/api/listening";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25];

export function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
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
    getLesson(id).then(setLesson).catch((e) => setError(errorMessage(e, t)));
  }, [id, t]);

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
      setError(errorMessage(e, t));
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
      <Link href="/listening" className="text-sm text-muted-foreground underline underline-offset-4">← {t("listen.title")}</Link>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {lesson && (
        <div className="mt-4 max-w-2xl space-y-8">
          <header className="space-y-1">
            <h1 className="text-2xl sm:text-3xl">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </header>

          <section aria-label={t("listen.audio")} className="space-y-3">
            {lesson.audio_url ? (
              <audio ref={audioRef} controls src={lesson.audio_url} className="w-full" />
            ) : (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Button onClick={speak}>{t("listen.browserVoice")}</Button>
                <span className="text-sm text-muted-foreground">{t("listen.noRecording")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm" role="group" aria-label={t("listen.speed")}>
              <span className="text-muted-foreground">{t("listen.speed")}</span>
              {SPEEDS.map((s) => (
                <Button key={s} size="sm" variant={speed === s ? "default" : "outline"} aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                  {s}×
                </Button>
              ))}
            </div>
          </section>

          <section aria-label={t("listen.questions")} className="space-y-6">
            {lesson.questions.map((q, qi) => {
              const r = result?.results.find((x) => x.question_id === q.id);
              return (
                <fieldset key={q.id} className="space-y-2" disabled={!!result}>
                  <legend className="mb-2 font-display">{qi + 1}. {q.prompt}</legend>
                  {q.choices.map((c, ci) => {
                    const picked = answers[q.id] === ci;
                    return (
                      <label
                        key={ci}
                        className={cn(
                          "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          picked && !result && "border-primary bg-muted",
                          r && ci === r.correct_index && "border-green-600 bg-green-50 dark:bg-green-950/30",
                          r && picked && !r.correct && "border-destructive bg-destructive/10",
                        )}
                      >
                        <input type="radio" name={`q-${q.id}`} checked={picked} onChange={() => setAnswers((a) => ({ ...a, [q.id]: ci }))} />
                        {c}
                        {r && ci === r.correct_index && <span className="sr-only"> {t("quiz.correctSr")}</span>}
                      </label>
                    );
                  })}
                  {r?.explanation && <p className="text-sm text-muted-foreground">{r.explanation}</p>}
                </fieldset>
              );
            })}
            {!result ? (
              <Button size="lg" onClick={submit} disabled={busy || Object.keys(answers).length === 0}>
                {busy ? t("listen.checking") : t("listen.check")}
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <p role="status" data-testid="listening-score" className="text-xl font-medium">{result.score} / {result.total}</p>
                <Button variant="outline" onClick={retry}>{t("listen.tryAgain")}</Button>
              </div>
            )}
          </section>

          <section aria-label={t("listen.transcript")} className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
                {showTranscript ? t("listen.hide") : t("listen.show")}
              </Button>
              {showTranscript && lesson.transcript_vi && (
                <Button variant="outline" onClick={() => setShowVi((v) => !v)} aria-pressed={showVi}>
                  {t("listen.vi")}
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
