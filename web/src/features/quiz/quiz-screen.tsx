"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { answerQuiz, getQuickQuiz, type QuizQuestion } from "@/lib/api/stats";
import { PlayButton } from "@/features/library/play-button";
import { cn } from "@/lib/utils";

type Feedback = { chosen: number; correct: boolean; correctMeaning: string };

export function QuizScreen() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getQuickQuiz(5).then((q) => !cancelled && setQuestions(q)).catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [round]);

  function restart() {
    setQuestions(null);
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setRound((r) => r + 1);
  }

  async function choose(q: QuizQuestion, choice: number) {
    if (feedback) return;
    try {
      const res = await answerQuiz([{ word_id: q.word_id, choice_word_id: choice }]);
      const r = res.results[0];
      setFeedback({ chosen: choice, correct: r.correct, correctMeaning: r.correct_meaning_vi });
      if (r.correct) setScore((s) => s + 1);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  const q = questions?.[index];
  const finished = questions && index >= questions.length;

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Quick quiz</h1>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {!questions && !error && <p className="text-muted-foreground">Preparing…</p>}
        {questions && questions.length === 0 && <p className="text-muted-foreground">Not enough words for a quiz yet.</p>}

        {q && (
          <section className="space-y-5">
            <p className="text-sm text-muted-foreground">Question {index + 1} of {questions!.length}</p>
            <div className="flex items-center gap-1">
              <p data-testid="quiz-term" className="text-4xl font-semibold tracking-tight">{q.term}</p>
              <PlayButton term={q.term} audioUrl={null} />
            </div>
            <p className="text-muted-foreground">What does it mean?</p>
            <ul className="space-y-2">
              {q.options.map((o) => {
                const isChosen = feedback?.chosen === o.word_id;
                const isCorrect = feedback && o.meaning_vi === feedback.correctMeaning;
                return (
                  <li key={o.word_id}>
                    <button
                      type="button"
                      disabled={!!feedback}
                      onClick={() => choose(q, o.word_id)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:cursor-default",
                        isCorrect && "border-green-600 bg-green-50 dark:bg-green-950/30",
                        isChosen && !feedback?.correct && "border-destructive bg-destructive/10",
                      )}
                    >
                      {o.meaning_vi}
                      {feedback && isCorrect && <span className="sr-only"> (correct answer)</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            {feedback && (
              <div className="flex items-center justify-between">
                <p role="status">{feedback.correct ? "Correct!" : "Not quite. The answer is highlighted."}</p>
                <Button onClick={() => (setIndex(index + 1), setFeedback(null))}>{index + 1 === questions!.length ? "See result" : "Next"}</Button>
              </div>
            )}
          </section>
        )}

        {finished && questions!.length > 0 && (
          <section className="space-y-4">
            <p className="text-3xl font-semibold" data-testid="quiz-score">{score} / {questions!.length}</p>
            <p className="text-muted-foreground">Quizzes are just for practice. They don&apos;t change your review schedule.</p>
            <div className="flex gap-3">
              <Button onClick={restart}>Another round</Button>
              <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to today</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
