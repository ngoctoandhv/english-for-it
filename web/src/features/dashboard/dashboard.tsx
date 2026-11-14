"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { RankCard, WeekDots } from "@/features/growth/rank-card";
import { errorMessage } from "@/lib/api/errors";
import { getGrowth, type Growth } from "@/lib/api/growth";
import { getPath, stepHref, type PathOverview } from "@/lib/api/path";
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
  const summary = open
    ? t("dash.left", { left: open.total_items - open.completed_items, total: open.total_items })
    : data.can_start
      ? data.new_available > 0
        ? t("dash.todoNew", { due: data.due_count, new: data.new_available })
        : t("dash.todo", { due: data.due_count })
      : t("dash.caughtUp");

  const next = path?.next_up;
  const step = next?.step;

  return (
    <div className="space-y-14">
      <section className="max-w-2xl space-y-5">
        <h1 className="text-4xl sm:text-5xl">{t("dash.title")}</h1>
        <p className="text-lg text-muted-foreground">{summary}</p>
        {data.backlog && <p className="max-w-prose text-muted-foreground">{t("dash.backlog")}</p>}
        {data.can_start && (
          <Link href="/learn" className={buttonVariants({ size: "lg", variant: next ? "outline" : "default", className: "w-full sm:w-auto" })}>
            {open ? t("dash.continue") : t("dash.start")}
          </Link>
        )}
      </section>

      <section aria-labelledby="next" className="max-w-2xl">
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
            <Link href={stepHref(step, next.unit)} className={buttonVariants({ size: "lg" })}>{t("home.go")}</Link>
          </div>
        ) : (
          <p className="border-y py-5 text-muted-foreground">{t("home.allDone")}</p>
        )}
        <Link href="/path" className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("home.viewPath")}</Link>
      </section>

      {growth && (
        <section aria-labelledby="growth" className="max-w-2xl space-y-6">
          <SectionTitle id="growth">{t("home.growth")}</SectionTitle>
          <RankCard growth={growth} />
          <WeekDots growth={growth} />
          <Link href="/progress" className="inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("nav.progress")}</Link>
        </section>
      )}
    </div>
  );
}
