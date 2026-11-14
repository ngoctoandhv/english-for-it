"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Brand } from "@/components/layout/brand";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { Dashboard } from "@/features/dashboard/dashboard";

const PRACTICE = [
  { title: "Vocabulary in context", text: "Words like blocker, rollback and pull request, each with a real workplace sentence and a Vietnamese meaning." },
  { title: "Listening", text: "Short dialogues with a transcript, a translation and questions that check what you understood." },
  { title: "Scenarios", text: "Scripted conversations for standups, code reviews, bug reports and incident updates." },
  { title: "Spaced review", text: "Cards come back when you are about to forget them. Missed days never erase your progress." },
];

export function HomeGate() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  if (status === "authenticated" && user?.onboarded) {
    return (
      <AppShell>
        <Dashboard />
      </AppShell>
    );
  }
  const authed = status === "authenticated";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Brand />
          {!authed && (
            <Link href="/login" className="text-[15px] text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="max-w-2xl space-y-6 py-20 sm:py-28">
          <h1 className="text-5xl leading-[1.05] sm:text-7xl">English for IT work</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Learn the words and phrases you use in standups, code reviews and incident updates. Study for five to ten minutes a day.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href={authed ? "/onboarding" : "/register"} className={buttonVariants({ size: "lg" })}>
              {authed ? "Set up your account" : "Create account"}
            </Link>
          </div>
        </section>
        <section aria-labelledby="practice" className="max-w-2xl pb-24">
          <h2 id="practice" className="mb-4 text-3xl">What you practise</h2>
          <ul className="divide-y border-y">
            {PRACTICE.map((p) => (
              <li key={p.title} className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-8">
                <h3 className="text-base font-medium">{p.title}</h3>
                <p className="text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
