"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { errorMessage } from "@/lib/api/errors";
import { getDashboard, type Dashboard as DashboardData } from "@/lib/api/stats";

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!data) return <p className="text-muted-foreground">Loading…</p>;

  const open = data.open_session;
  const label = open ? "Continue learning" : "Start learning";
  const summary = open
    ? `${open.total_items - open.completed_items} cards left in today's session.`
    : data.can_start
      ? `${data.due_count} to review${data.new_available > 0 ? ` · ${data.new_available} new` : ""}. About ${user?.daily_goal_minutes ?? 10} minutes.`
      : "You're all caught up. Nothing is due right now.";

  return (
    <div className="space-y-8">
      <section className="space-y-5 rounded-2xl border bg-gradient-to-br from-brand-soft via-card to-card p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">Today</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hi{user ? `, ${user.name}` : ""} 👋</h1>
        <p className="text-lg text-muted-foreground">{summary}</p>
        {data.backlog && (
          <p className="max-w-prose text-sm text-muted-foreground">
            You have some cards waiting. No problem: we&apos;ll bring them back a few at a time and pause new words until you&apos;re comfortable.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {data.can_start ? (
            <Link href="/learn" className={buttonVariants({ size: "lg", className: "h-12 px-7 text-base shadow-md shadow-primary/25" })}>
              {label}
            </Link>
          ) : (
            <Link href="/quiz" className={buttonVariants({ size: "lg", className: "h-12 px-7 text-base shadow-md shadow-primary/25" })}>
              Take a quick quiz
            </Link>
          )}
          {data.can_start && (
            <Link href="/quiz" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-7 text-base" })}>
              Quick quiz
            </Link>
          )}
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Reviewed today" value={data.reviewed_today} />
        <Stat label="Days studied this week" value={`${data.days_studied_this_week}/7`} />
        <Stat label="Words started" value={data.words_started} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <dd className="text-3xl font-semibold tabular-nums tracking-tight">{value}</dd>
      <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}
