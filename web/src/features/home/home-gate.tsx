"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { HealthBadge } from "@/features/health/health-badge";
import { AppShell } from "@/components/layout/app-shell";

export function HomeGate() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  if (status === "authenticated" && user?.onboarded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight">Ready when you are{user.name ? `, ${user.name}` : ""}</h1>
          <Link href="/learn" className={buttonVariants({ size: "lg" })}>
            Start learning
          </Link>
        </div>
      </AppShell>
    );
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">English for IT</h1>
      <p className="text-lg text-muted-foreground">Learn the English you need at work, 5–10 minutes a day.</p>
      <div className="flex gap-3">
        <Link href={status === "authenticated" ? "/onboarding" : "/register"} className={buttonVariants({ size: "lg" })}>
          Get started
        </Link>
        {status === "anonymous" && (
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Sign in
          </Link>
        )}
      </div>
      <HealthBadge />
    </main>
  );
}
