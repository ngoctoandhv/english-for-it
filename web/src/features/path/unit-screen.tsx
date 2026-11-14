"use client";

import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { getUnit, stepHref, type PathStep, type PathUnit } from "@/lib/api/path";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const GOAL: Record<string, string> = {
  words: "path.wordsGoal",
  listening: "path.listeningGoal",
  scenario: "path.scenarioGoal",
  quiz: "path.quizGoal",
};

export function UnitScreen() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const [unit, setUnit] = useState<PathUnit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUnit(slug).then(setUnit).catch((e) => setError(errorMessage(e, t)));
  }, [slug, t]);

  const locked = unit?.status === "locked";

  return (
    <AppShell>
      <Link href="/path" className="text-sm text-muted-foreground underline underline-offset-4">{t("path.back")}</Link>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {unit && (
        <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="lg:sticky lg:top-24">
          <h1 className="text-3xl sm:text-4xl">{unit.title}</h1>
          <p className="mt-3 text-muted-foreground">{unit.description}</p>
          <p className="mt-2 font-display text-xs text-muted-foreground">
            {t(`path.status.${unit.status}`)} · {t("path.stepsDone", { done: unit.steps_done, total: unit.steps_total })}
          </p>
          {locked && <p className="mt-4 flex items-center gap-2 text-sm"><Lock className="size-4" aria-hidden /> {t("path.lockedText")}</p>}
          </div>

          <section aria-labelledby="route">
            <SectionTitle id="route">{t("path.title")}</SectionTitle>
            <ol className="divide-y border-y">
              {unit.steps.map((s, i) => (
                <StepRow key={s.id} step={s} index={i + 1} unitSlug={unit.slug} current={unit.next_step?.id === s.id} locked={locked} />
              ))}
            </ol>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function StepRow({ step, index, unitSlug, current, locked }: { step: PathStep; index: number; unitSlug: string; current: boolean; locked: boolean }) {
  const { t } = useI18n();
  const title = step.kind === "quiz" ? t("path.kind.quiz") : step.title;
  const detail = step.kind === "words" ? t("path.wordsLearned", { done: step.done, total: step.total }) : t(GOAL[step.kind]);
  return (
    <li className={cn("flex items-center gap-4 py-4 sm:px-2", locked && "opacity-60")}>
      <span
        aria-hidden
        className={cn("grid size-9 shrink-0 place-items-center rounded-full border font-display text-sm", step.complete && "border-primary bg-primary text-primary-foreground", current && !step.complete && "border-primary text-primary")}
      >
        {step.complete ? <Check className="size-4" /> : index}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xs text-muted-foreground">{t(`path.kind.${step.kind}`)}</span>
        <span className="block truncate font-display text-base">{title}</span>
        <span className="block text-sm text-muted-foreground">{detail}</span>
      </span>
      <span className="sr-only">{step.complete ? t("path.stepDone") : t("path.stepTodo")}</span>
      {!locked && (
        <Link href={stepHref(step, unitSlug)} className={buttonVariants({ variant: current && !step.complete ? "default" : "outline", size: "sm" })}>
          {step.complete ? t("path.again") : current ? t("path.continue") : t("path.go")}
        </Link>
      )}
    </li>
  );
}
