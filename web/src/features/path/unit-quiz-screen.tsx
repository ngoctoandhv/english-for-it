"use client";

import { Volume2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { answerUnitQuiz, getUnitQuiz, type UnitQuizQuestion, type UnitQuizResult } from "@/lib/api/path";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Picked = { word_id: number; choice_word_id: number };

export function UnitQuizScreen() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const [questions, setQuestions] = useState<UnitQuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<UnitQuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUnitQuiz(slug).then((q) => !cancelled && setQuestions(q)).catch((e) => !cancelled && setError(errorMessage(e, t)));
    return () => {
      cancelled = true;
    };
  }, [slug, round, t]);

  const q = questions?.[index];

  async function next() {
    if (!questions || chosen === null || !q) return;
    const all = [...picked, { word_id: q.word_id, choice_word_id: chosen }];
    setChosen(null);
    if (index + 1 < questions.length) {
      setPicked(all);
      setIndex(index + 1);
      return;
    }
    try {
      setResult(await answerUnitQuiz(slug, all));
    } catch (e) {
      setError(errorMessage(e, t));
    }
  }

  function retry() {
    setQuestions(null);
    setIndex(0);
    setPicked([]);
    setChosen(null);
    setResult(null);
    setRound((r) => r + 1);
  }

  return (
    <AppShell>
      <Link href={`/path/${slug}`} className="text-sm text-muted-foreground underline underline-offset-4">{t("pathquiz.backUnit")}</Link>
      <div className="mt-4 max-w-3xl space-y-6">
        <h1 className="text-3xl sm:text-4xl">{t("pathquiz.title")}</h1>
        {!result && <p className="text-muted-foreground">{t("pathquiz.sub")}</p>}
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {!questions && !error && <p className="text-muted-foreground">{t("common.loading")}</p>}
        {questions && questions.length === 0 && <p className="text-muted-foreground">{t("pathquiz.noWords")}</p>}

        {q && !result && (
          <section className="space-y-5">
            <p className="tnum text-sm text-muted-foreground">{t("quiz.questionOf", { n: index + 1, total: questions!.length })}</p>
            <div className="flex items-center gap-2">
              <p data-testid="quiz-term" className="break-words font-display text-4xl leading-none sm:text-5xl">{q.term}</p>
              <Button variant="ghost" size="icon" aria-label={t("lib.play", { term: q.term })} onClick={() => playWord(q.term, null)}><Volume2 aria-hidden /></Button>
            </div>
            <p className="text-muted-foreground">{t("quiz.whatMeans")}</p>
            <ul className="space-y-2">
              {q.options.map((o) => (
                <li key={o.word_id}>
                  <button
                    type="button"
                    aria-pressed={chosen === o.word_id}
                    onClick={() => setChosen(o.word_id)}
                    className={cn("min-h-12 w-full rounded-lg border bg-card px-4 py-2.5 text-left hover:border-foreground/40", chosen === o.word_id && "border-primary bg-accent")}
                  >
                    {o.meaning_vi}
                  </button>
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full sm:w-auto" disabled={chosen === null} onClick={next}>
              {index + 1 === questions!.length ? t("quiz.seeResult") : t("quiz.next")}
            </Button>
          </section>
        )}

        {result && (
          <section className="space-y-5" aria-live="polite">
            <p className="font-display text-5xl leading-none tnum sm:text-6xl" data-testid="quiz-score">{result.score} / {result.total}</p>
            <p className="text-lg">{!result.saved ? t("pathquiz.notSaved") : result.passed ? t("pathquiz.passed") : t("pathquiz.failed")}</p>
            {result.saved && (result.xp_gained ?? 0) > 0 && <p className="font-display text-primary">{t("pathquiz.xp", { xp: result.xp_gained ?? 0 })}</p>}
            {result.units_completed?.map((u) => (
              <p key={u.slug} className="font-display" data-testid="unit-completed">{t("pathquiz.unitDone", { title: u.title })}</p>
            ))}
            {result.rank_up && <p className="font-display text-primary">{t("pathquiz.rankUp", { rank: t(`rank.${result.rank_up.key}`) })}</p>}
            <div className="flex flex-wrap gap-3">
              {!result.passed && <Button size="lg" onClick={retry}>{t("pathquiz.retry")}</Button>}
              <Link href="/path" className={buttonVariants({ size: "lg", variant: result.passed ? "default" : "outline" })}>{t("pathquiz.nextUnit")}</Link>
              <Link href={`/path/${slug}`} className={buttonVariants({ size: "lg", variant: "ghost" })}>{t("pathquiz.backUnit")}</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
