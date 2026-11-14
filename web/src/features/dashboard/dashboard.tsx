"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { getDashboard, type Dashboard as DashboardData } from "@/lib/api/stats";
import { useI18n } from "@/lib/i18n/provider";

export function Dashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(errorMessage(e, t)));
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

  const practice = [
    { href: "/library", title: t("nav.vocabulary"), text: t("dash.vocab") },
    { href: "/listening", title: t("nav.listening"), text: t("dash.listening") },
    { href: "/scenarios", title: t("nav.scenarios"), text: t("dash.scenarios") },
    { href: "/quiz", title: t("dash.quiz"), text: t("dash.quizText") },
  ];

  return (
    <div className="space-y-14">
      <section className="max-w-2xl space-y-5">
        <h1 className="text-4xl sm:text-5xl">{t("dash.title")}</h1>
        <p className="text-lg text-muted-foreground">{summary}</p>
        {data.backlog && <p className="max-w-prose text-muted-foreground">{t("dash.backlog")}</p>}
        {data.can_start && (
          <Link href="/learn" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
            {open ? t("dash.continue") : t("dash.start")}
          </Link>
        )}
      </section>

      <section aria-labelledby="week" className="max-w-2xl">
        <SectionTitle id="week">{t("dash.week")}</SectionTitle>
        <dl className="divide-y border-y">
          <Row label={t("dash.reviewedToday")} value={data.reviewed_today} />
          <Row label={t("dash.daysStudied")} value={t("dash.daysOf", { n: data.days_studied_this_week })} />
          <Row label={t("dash.wordsStarted")} value={data.words_started} />
        </dl>
      </section>

      <section aria-labelledby="practise" className="max-w-2xl">
        <SectionTitle id="practise">{t("dash.practise")}</SectionTitle>
        <ul className="divide-y border-y">
          {practice.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="grid gap-1 py-4 hover:bg-muted/50 sm:grid-cols-[11rem_1fr] sm:gap-8 sm:px-2">
                <span className="font-display">{p.title}</span>
                <span className="text-muted-foreground">{p.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tnum font-display">{value}</dd>
    </div>
  );
}
