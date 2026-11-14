"use client";

import { Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Split } from "@/components/layout/split";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playWord } from "@/features/library/speak";
import { SayIt } from "@/features/speaking/say-it";
import { errorMessage } from "@/lib/api/errors";
import { answerQuiz, getQuickQuiz, type QuizMode, type QuizQuestion, type QuizResult } from "@/lib/api/stats";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";


/** "say" is a practice mode with no server grading: words come from the choice quiz and the learner speaks them. */
type PracticeMode = QuizMode | "say";
type Feedback = { correct: boolean; close: boolean; term: string; meaning: string; chosen?: number };

export function QuizScreen() {
  const { t } = useI18n();
  const MODES: { mode: PracticeMode; title: string; text: string }[] = [
    { mode: "choice", title: t("quiz.choose"), text: t("quiz.chooseText") },
    { mode: "listen", title: t("quiz.listen"), text: t("quiz.listenText") },
    { mode: "type", title: t("quiz.type"), text: t("quiz.typeText") },
    { mode: "cloze", title: t("quiz.cloze"), text: t("quiz.clozeText") },
    { mode: "say", title: t("quiz.say"), text: t("quiz.sayText") },
  ];
  const [mode, setMode] = useState<PracticeMode | null>(null);
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
    getQuickQuiz(mode === "say" ? "choice" : mode, 5).then((q) => !cancelled && setQuestions(q)).catch((e) => !cancelled && setError(errorMessage(e, t)));
    return () => {
      cancelled = true;
    };
  }, [mode, t]);

  const q = questions?.[index];

  // Listening questions play on their own as soon as they appear.
  useEffect(() => {
    if (q?.mode === "listen") playWord(q.speak_text ?? "", q.audio_url);
  }, [q]);

  function start(m: PracticeMode) {
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
      setError(errorMessage(e, t));
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
      <div className="space-y-8">
        <h1 className="text-3xl sm:text-4xl">{t("quiz.title")}</h1>

        {!mode && (
          <ul className="grid grid-cols-1 border-t lg:grid-cols-2 lg:gap-x-12 [&>li]:min-w-0 [&>li]:border-b">
            {MODES.map((m) => (
              <li key={m.mode}>
                <button type="button" onClick={() => start(m.mode)} className="grid w-full gap-1 py-4 text-left hover:bg-muted/50 sm:grid-cols-[8rem_1fr] sm:gap-8 sm:px-2">
                  <span className="font-display">{m.title}</span>
                  <span className="text-muted-foreground">{m.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {mode ? (
          <Split
            aside={
              <nav aria-label={t("quiz.title")} className="space-y-3">
                <p className="font-display text-xs text-muted-foreground">{t("quiz.modes")}</p>
                <ul className="divide-y border-y">
                  {MODES.map((m) => (
                    <li key={m.mode}>
                      <button type="button" aria-current={mode === m.mode ? "true" : undefined} onClick={() => start(m.mode)} className={cn("w-full px-2 py-3 text-left hover:bg-muted/50", mode === m.mode && "bg-accent text-accent-foreground")}>
                        <span className="block font-display text-sm">{m.title}</span>
                        <span className="block text-sm text-muted-foreground">{m.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            }
          >
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {mode && !questions && !error && <p className="text-muted-foreground">{t("learn.preparing")}</p>}
          {questions && questions.length === 0 && <p className="text-muted-foreground">{t("quiz.notEnough")}</p>}

          {q && (
            <section className="space-y-6">
              <p className="tnum text-sm text-muted-foreground">{t("quiz.questionOf", { n: index + 1, total: questions!.length })}</p>

              {q.mode === "choice" && mode === "say" && (
                <div className="space-y-4">
                  <p data-testid="quiz-term" className="break-words font-display text-4xl leading-none sm:text-5xl">{q.term}</p>
                  {q.ipa && <p className="font-display text-muted-foreground">{q.ipa}</p>}
                  <p className="text-muted-foreground">{t("quiz.sayPrompt")}</p>
                  <SayIt key={q.word_id} text={q.term} audioUrl={null} />
                  <Button size="lg" onClick={next}>{index + 1 === questions!.length ? t("quiz.seeResult") : t("quiz.next")}</Button>
                </div>
              )}

              {q.mode === "choice" && mode !== "say" && (
                <>
                  <div className="flex items-center gap-2">
                    <p data-testid="quiz-term" className="break-words font-display text-4xl leading-none sm:text-5xl">{q.term}</p>
                    <Button variant="ghost" size="icon" aria-label={t("lib.play", { term: q.term })} onClick={() => playWord(q.term, null)}><Volume2 aria-hidden /></Button>
                  </div>
                  <p className="text-muted-foreground">{t("quiz.whatMeans")}</p>
                  <Options
                    options={q.options.map((o) => ({ id: o.word_id, label: o.meaning_vi }))}
                    feedback={feedback}
                    isCorrect={(o) => o.label === feedback?.meaning}
                    onPick={(id) => submit(q, { choice_word_id: id })}
                    correctSr={t("quiz.correctSr")}
                    wrongSr={t("quiz.wrongSr")}
                  />
                </>
              )}

              {q.mode === "listen" && (
                <>
                  <div className="flex items-center gap-3">
                    <Button size="lg" onClick={() => playWord(q.speak_text ?? "", q.audio_url)}><Volume2 aria-hidden /> {t("quiz.playAgain")}</Button>
                    <span data-testid="quiz-term" className="text-muted-foreground">{t("quiz.whichHear")}</span>
                  </div>
                  <Options
                    options={q.options.map((o) => ({ id: o.word_id, label: o.term }))}
                    feedback={feedback}
                    isCorrect={(o) => o.label === feedback?.term}
                    onPick={(id) => submit(q, { choice_word_id: id })}
                    correctSr={t("quiz.correctSr")}
                    wrongSr={t("quiz.wrongSr")}
                  />
                </>
              )}

              {q.mode === "cloze" && (
                <form
                  className="space-y-4"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    if (typed.trim()) void submit(q, { text: typed });
                  }}
                >
                  <p data-testid="quiz-term" className="text-xl leading-snug sm:text-2xl">{q.sentence}</p>
                  <p className="text-sm text-muted-foreground">{q.translation_vi}</p>
                  <p className="text-muted-foreground">
                    {t("quiz.typeHint", { pos: q.part_of_speech, length: q.length, letter: q.first_letter })}
                  </p>
                  <Input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!!feedback} aria-label={t("quiz.yourAnswer")} autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus />
                  {!feedback && <Button type="submit" size="lg" disabled={!typed.trim()}>{t("quiz.check")}</Button>}
                </form>
              )}

              {q.mode === "type" && (
                <form
                  className="space-y-4"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    if (typed.trim()) void submit(q, { text: typed });
                  }}
                >
                  <p data-testid="quiz-term" className="text-xl leading-snug sm:text-2xl">{q.definition_en}</p>
                  <p className="text-muted-foreground">
                    {t("quiz.typeHint", { pos: q.part_of_speech, length: q.length, letter: q.first_letter })}
                  </p>
                  <Input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!!feedback} aria-label={t("quiz.yourAnswer")} autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus />
                  {!feedback && <Button type="submit" size="lg" disabled={!typed.trim()}>{t("quiz.check")}</Button>}
                </form>
              )}

              {feedback && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <p role="status">
                    {feedback.correct ? t("quiz.correct") : feedback.close ? t("quiz.almost", { term: feedback.term }) : t("quiz.notQuite", { term: feedback.term, meaning: feedback.meaning })}
                  </p>
                  <Button size="lg" onClick={next}>{index + 1 === questions!.length ? t("quiz.seeResult") : t("quiz.next")}</Button>
                </div>
              )}
            </section>
          )}

          {finished && questions!.length > 0 && (
            <section className="space-y-5">
              {mode !== "say" && <p className="font-display text-5xl leading-none tnum sm:text-6xl" data-testid="quiz-score">{score} / {questions!.length}</p>}
              <p className="text-muted-foreground">{mode === "say" ? t("quiz.sayDone") : t("quiz.note")}</p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => start(mode!)}>{t("quiz.another")}</Button>
                <Button size="lg" variant="outline" onClick={() => { setMode(null); setQuestions(null); }}>{t("quiz.change")}</Button>
                <Link href="/" className={buttonVariants({ size: "lg", variant: "ghost" })}>{t("learn.backToday")}</Link>
              </div>
            </section>
          )}
          </Split>
        ) : null}
      </div>
    </AppShell>
  );
}

function Options({ options, feedback, isCorrect, onPick, correctSr, wrongSr }: {
  correctSr: string;
  wrongSr: string;
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
                "min-h-12 w-full rounded-lg border bg-card px-4 py-2.5 text-left hover:border-foreground/40 disabled:cursor-default",
                correct && "border-success bg-success/10",
                wrongPick && "border-destructive bg-destructive/10",
              )}
            >
              {o.label}
              {correct && <span className="sr-only"> {correctSr}</span>}
              {wrongPick && <span className="sr-only"> {wrongSr}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
