"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { getDashboard, type Dashboard as DashboardData } from "@/lib/api/stats";

const PRACTICE = [
  { href: "/library", title: "Vocabulary", text: "Browse words by topic or collection." },
  { href: "/listening", title: "Listening", text: "Short dialogues with questions." },
  { href: "/scenarios", title: "Scenarios", text: "Practise a work conversation step by step." },
  { href: "/quiz", title: "Quick quiz", text: "Choose, listen or type. It does not change your schedule." },
];

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!data) return <p className="text-muted-foreground">Loading…</p>;

  const open = data.open_session;
  const summary = open
    ? `${open.total_items - open.completed_items} of ${open.total_items} cards left in today's session.`
    : data.can_start
      ? `${data.due_count} ${data.due_count === 1 ? "card" : "cards"} to review${data.new_available > 0 ? ` and ${data.new_available} new ${data.new_available === 1 ? "word" : "words"}` : ""}.`
      : "Nothing is due right now. You are all caught up.";

  return (
    <div className="space-y-16">
      <section className="max-w-2xl space-y-5">
        <h1 className="text-5xl leading-[1.05]">Today</h1>
        <p className="text-lg text-muted-foreground">{summary}</p>
        {data.backlog && (
          <p className="max-w-prose text-muted-foreground">
            Some cards are waiting. We bring them back a few at a time and pause new words until you are comfortable.
          </p>
        )}
        {data.can_start && (
          <Link href="/learn" className={buttonVariants({ size: "lg" })}>
            {open ? "Continue session" : "Start learning"}
          </Link>
        )}
      </section>

      <section aria-labelledby="week" className="max-w-2xl">
        <h2 id="week" className="mb-3 text-2xl">This week</h2>
        <dl className="divide-y border-y">
          <Row label="Cards reviewed today" value={data.reviewed_today} />
          <Row label="Days studied in the last 7" value={`${data.days_studied_this_week} of 7`} />
          <Row label="Words started" value={data.words_started} />
        </dl>
      </section>

      <section aria-labelledby="practise" className="max-w-2xl">
        <h2 id="practise" className="mb-3 text-2xl">Practise</h2>
        <ul className="divide-y border-y">
          {PRACTICE.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="grid gap-1 py-4 hover:bg-muted/50 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:px-2">
                <span className="font-medium">{p.title}</span>
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
    <div className="flex items-baseline justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tnum font-medium">{value}</dd>
    </div>
  );
}
