"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { HealthBadge } from "@/features/health/health-badge";
import { Brand } from "@/components/layout/brand";
import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/features/dashboard/dashboard";

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
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-7 px-6 py-16">
      <Brand />
      <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
        The English you need at work, <span className="text-primary">in 5–10 minutes a day.</span>
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Vocabulary in real developer situations, short listening lessons and scripted conversations like standups and code reviews. Miss a day? Nothing is lost.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={status === "authenticated" ? "/onboarding" : "/register"} className={buttonVariants({ size: "lg", className: "h-12 px-7 text-base shadow-md shadow-primary/25" })}>
          Get started
        </Link>
        {status === "anonymous" && (
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-7 text-base" })}>
            Sign in
          </Link>
        )}
      </div>
      <HealthBadge />
    </main>
  );
}
