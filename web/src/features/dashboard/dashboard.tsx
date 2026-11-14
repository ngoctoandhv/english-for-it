"use client";

import { Mic } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { VocabStrength } from "./vocab-strength";
import { RankCard, WeekDots } from "@/features/growth/rank-card";
import { errorMessage } from "@/lib/api/errors";
import { getGrowth, type Growth } from "@/lib/api/growth";
import { getPath, stepHref, type PathOverview } from "@/lib/api/path";
import { EXTRA_SIZES } from "@/lib/api/learning";
import { getDashboard, type Dashboard as DashboardData } from "@/lib/api/stats";
import { useI18n } from "@/lib/i18n/provider";

export function Dashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [path, setPath] = useState<PathOverview | null>(null);
  const [growth, setGrowth] = useState<Growth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboard(), getPath(), getGrowth()])
      .then(([d, p, g]) => (setData(d), setPath(p), setGrowth(g)))
      .catch((e) => setError(errorMessage(e, t)));
  }, [t]);

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!data) return <p className="text-muted-foreground">{t("common.loading")}</p>;

  const open = data.open_session;
  const planned = Math.min(data.due_count, data.goal_cards) + data.new_available;
  const minutes = Math.max(1, Math.ceil(planned / 2));

  const next = path?.next_up;
  const step = next?.step;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl">{t("dash.title")}</h1>
      {data.days_away !== null && data.days_away >= 7 && (
        <p role="status" className="max-w-prose rounded-lg border border-primary/30 bg-primary/5 p-4" data-testid="welcome-back">{t("dash.welcomeBack")}</p>
      )}

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          <section aria-label={t("home.plan")} className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-primary/70" />
              <span className="ml-2 font-display text-xs text-muted-foreground">today.sh</span>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <p className="font-display text-sm text-primary">$ plan --today</p>
              {open ? (
                <p className="font-display text-lg">{t("dash.left", { left: open.total_items - open.completed_items, total: open.total_items })}</p>
              ) : data.can_start ? (
                <ul className="space-y-1.5 font-display text-lg">
                  {data.due_count > 0 && <li><span className="text-primary">› </span>{t("home.planReview", { n: Math.min(data.due_count, data.goal_cards) })}</li>}
                  {data.new_available > 0 && <li><span className="text-primary">› </span>{t("home.planNew", { n: data.new_available })}</li>}
                  <li className="text-muted-foreground"><span className="text-primary">› </span>{t("home.planMinutes", { n: minutes })}</li>
                </ul>
              ) : (
                <p className="text-lg text-muted-foreground">{t("dash.caughtUp")}</p>
              )}
              {data.backlog && <p className="max-w-prose text-sm text-muted-foreground">{t("dash.backlog")}</p>}
              {data.can_start ? (
                <Link href="/learn" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
                  {open ? t("dash.continue") : t("dash.start")}
                </Link>
              ) : null}
              {data.new_words_left > 0 && (
                <div className="space-y-2 border-t pt-4" data-testid="learn-more">
                  <p className="text-sm text-muted-foreground">{t("dash.moreText", { n: data.new_words_left })}</p>
                  <div className="flex flex-wrap gap-2">
                    {EXTRA_SIZES.map((n) => (
                      <Link key={n} href={`/learn?extra=${n}`} className={buttonVariants({ variant: !data.can_start && n === 10 ? "default" : "outline", size: "sm" })}>{t("learn.moreN", { n })}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="next">
            <SectionTitle id="next">{t("home.next")}</SectionTitle>
            {next && step ? (
              <div className="flex items-center gap-4 border-y py-5">
                <ProgressRing value={(next.steps_done / next.steps_total) * 100} size={52} label={t("path.stepsDone", { done: next.steps_done, total: next.steps_total })}>
                  {next.steps_done}/{next.steps_total}
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base">{next.unit_title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {t(`path.kind.${step.kind}`)}{step.title ? ` · ${step.title}` : ""}
                  </p>
                </div>
                <Link href={stepHref(step, next.unit)} className={buttonVariants({ variant: "outline", size: "lg" })}>{t("home.go")}</Link>
              </div>
            ) : (
              <p className="border-y py-5 text-muted-foreground">{t("home.allDone")}</p>
            )}
            <Link href="/path" className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("home.viewPath")}</Link>
          </section>

          <section aria-labelledby="speak" className="rounded-lg border border-primary/30 bg-primary/5 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Mic className="mt-1 size-6 shrink-0 text-primary" aria-hidden />
              <div className="space-y-3">
                <h2 id="speak" className="text-lg">{t("home.speakTitle")}</h2>
                <p className="max-w-prose text-muted-foreground">{t("home.speakText")}</p>
                <Link href="/scenarios" className={buttonVariants({ variant: "outline" })}>{t("home.speakGo")}</Link>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-12">
          <VocabStrength vocabulary={data.vocabulary} />
          {growth && (
            <section aria-labelledby="growth" className="space-y-6">
              <SectionTitle id="growth">{t("home.growth")}</SectionTitle>
              <RankCard growth={growth} />
              <WeekDots growth={growth} />
              <Link href="/progress" className="inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("nav.progress")}</Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
