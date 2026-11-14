"use client";

import { Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { answerQuiz, getQuickQuiz, type QuizMode, type QuizQuestion, type QuizResult } from "@/lib/api/stats";
import { cn } from "@/lib/utils";

const MODES: { mode: QuizMode; title: string; text: string }[] = [
  { mode: "choice", title: "Choose", text: "Pick the Vietnamese meaning of a word." },
  { mode: "listen", title: "Listen", text: "Hear a word and pick what you heard." },
  { mode: "type", title: "Type", text: "Read a definition and type the word." },
];

type Feedback = { correct: boolean; close: boolean; term: string; meaning: string; chosen?: number };

export function QuizScreen() {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mode) return;
    let cancelled = false;
    getQuickQuiz(mode, 5).then((q) => !cancelled && setQuestions(q)).catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const q = questions?.[index];

  // Listening questions play on their own as soon as they appear.
  useEffect(() => {
    if (q?.mode === "listen") playWord(q.speak_text ?? "", q.audio_url);
  }, [q]);

  function start(m: QuizMode) {
    setQuestions(null);
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setTyped("");
    setError(null);
    setMode(m);
  }

  async function submit(question: QuizQuestion, answer: { choice_word_id?: number; text?: string }) {
    if (feedback) return;
    try {
      const res: QuizResult = await answerQuiz([{ word_id: question.word_id, ...answer }]);
      const r = res.results[0];
      setFeedback({ correct: r.correct, close: r.close, term: r.correct_term, meaning: r.correct_meaning_vi, chosen: answer.choice_word_id });
      if (r.correct) setScore((s) => s + 1);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setFeedback(null);
    setTyped("");
    queueMicrotask(() => inputRef.current?.focus());
  }

  const finished = questions && index >= questions.length;

  return (
    <AppShell>
      <div className="max-w-xl space-y-8">
        <h1 className="text-4xl leading-tight">Quick quiz</h1>

        {!mode && (
          <ul className="divide-y border-y">
            {MODES.map((m) => (
              <li key={m.mode}>
                <button type="button" onClick={() => start(m.mode)} className="grid w-full gap-1 py-4 text-left hover:bg-muted/50 sm:grid-cols-[8rem_1fr] sm:gap-8 sm:px-2">
                  <span className="font-medium">{m.title}</span>
                  <span className="text-muted-foreground">{m.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p role="alert" className="text-destructive">{error}</p>}
        {mode && !questions && !error && <p className="text-muted-foreground">Preparing…</p>}
        {questions && questions.length === 0 && <p className="text-muted-foreground">Not enough words for this quiz yet.</p>}

        {q && (
          <section className="space-y-6">
            <p className="tnum text-sm text-muted-foreground">Question {index + 1} of {questions!.length}</p>

            {q.mode === "choice" && (
              <>
                <div className="flex items-center gap-2">
                  <p data-testid="quiz-term" className="font-display text-5xl leading-none">{q.term}</p>
                  <Button variant="ghost" size="icon" aria-label={`Play ${q.term}`} onClick={() => playWord(q.term, null)}><Volume2 aria-hidden /></Button>
                </div>
                <p className="text-muted-foreground">What does it mean?</p>
                <Options
                  options={q.options.map((o) => ({ id: o.word_id, label: o.meaning_vi }))}
                  feedback={feedback}
                  isCorrect={(o) => o.label === feedback?.meaning}
                  onPick={(id) => submit(q, { choice_word_id: id })}
                />
              </>
            )}

            {q.mode === "listen" && (
              <>
                <div className="flex items-center gap-3">
                  <Button size="lg" onClick={() => playWord(q.speak_text ?? "", q.audio_url)}><Volume2 aria-hidden /> Play again</Button>
                  <span data-testid="quiz-term" className="text-muted-foreground">Which word do you hear?</span>
                </div>
                <Options
                  options={q.options.map((o) => ({ id: o.word_id, label: o.term }))}
                  feedback={feedback}
                  isCorrect={(o) => o.label === feedback?.term}
                  onPick={(id) => submit(q, { choice_word_id: id })}
                />
              </>
            )}

            {q.mode === "type" && (
              <form
                className="space-y-4"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  if (typed.trim()) void submit(q, { text: typed });
                }}
              >
                <p data-testid="quiz-term" className="text-2xl leading-snug">{q.definition_en}</p>
                <p className="text-muted-foreground">
                  {q.part_of_speech} · {q.length} letters, starts with “{q.first_letter}”
                </p>
                <Input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!!feedback} aria-label="Your answer" autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus />
                {!feedback && <Button type="submit" size="lg" disabled={!typed.trim()}>Check answer</Button>}
              </form>
            )}

            {feedback && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p role="status">
                  {feedback.correct ? "Correct." : feedback.close ? `Almost. The word is “${feedback.term}”.` : `Not quite. The answer is “${feedback.term}” (${feedback.meaning}).`}
                </p>
                <Button size="lg" onClick={next}>{index + 1 === questions!.length ? "See result" : "Next"}</Button>
              </div>
            )}
          </section>
        )}

        {finished && questions!.length > 0 && (
          <section className="space-y-5">
            <p className="font-display text-6xl leading-none tnum" data-testid="quiz-score">{score} / {questions!.length}</p>
            <p className="text-muted-foreground">Quizzes are for practice. They do not change your review schedule.</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => start(mode!)}>Another round</Button>
              <Button size="lg" variant="outline" onClick={() => { setMode(null); setQuestions(null); }}>Change mode</Button>
              <Link href="/" className={buttonVariants({ size: "lg", variant: "ghost" })}>Back to today</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Options({ options, feedback, isCorrect, onPick }: {
  options: { id: number; label: string }[];
  feedback: Feedback | null;
  isCorrect: (o: { id: number; label: string }) => boolean;
  onPick: (id: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((o) => {
        const correct = !!feedback && isCorrect(o);
        const wrongPick = !!feedback && feedback.chosen === o.id && !feedback.correct;
        return (
          <li key={o.id}>
            <button
              type="button"
              disabled={!!feedback}
              onClick={() => onPick(o.id)}
              className={cn(
                "min-h-11 w-full rounded-lg border bg-card px-4 py-2.5 text-left hover:border-foreground/40 disabled:cursor-default",
                correct && "border-success bg-success/10",
                wrongPick && "border-destructive bg-destructive/10",
              )}
            >
              {o.label}
              {correct && <span className="sr-only"> (correct answer)</span>}
              {wrongPick && <span className="sr-only"> (your answer, incorrect)</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
