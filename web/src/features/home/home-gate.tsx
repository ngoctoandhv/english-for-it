"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Brand } from "@/components/layout/brand";
import { Preferences } from "@/components/layout/preferences";
import { SectionTitle } from "@/components/layout/section-title";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { PublicFooter } from "@/components/layout/public-shell";
import { TryIt } from "./try-it";
import { Dashboard } from "@/features/dashboard/dashboard";
import { useI18n } from "@/lib/i18n/provider";

export function HomeGate() {
  const { status, user } = useAuth();
  const { t } = useI18n();
  if (status === "loading") return null;
  if (status === "authenticated" && user?.onboarded) {
    return (
      <AppShell>
        <Dashboard />
      </AppShell>
    );
  }
  const authed = status === "authenticated";
  const practice = [1, 2, 3, 4].map((n) => ({ title: t(`landing.p${n}.title`), text: t(`landing.p${n}.text`) }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
          <Brand />
          <div className="flex items-center gap-3">
            <Preferences />
            {!authed && (
              <Link href="/login" className="hidden text-[15px] text-muted-foreground hover:text-foreground sm:inline">
                {t("nav.signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="space-y-6">
            <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">{t("landing.title")}</h1>
            <p className="max-w-xl text-lg text-muted-foreground">{t("landing.lead")}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={authed ? "/onboarding" : "/register"} className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
                {authed ? t("landing.ctaSetup") : t("landing.cta")}
              </Link>
              {!authed && (
                <Link href="/login" className="text-[15px] text-muted-foreground underline underline-offset-4 hover:text-foreground sm:hidden">
                  {t("nav.signIn")}
                </Link>
              )}
            </div>
          </div>

          <figure className="overflow-hidden rounded-lg border bg-card font-display text-[13px] leading-6 sm:text-sm" aria-label="Code review example">
            <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-muted-foreground">
              <span aria-hidden className="size-2.5 rounded-full bg-destructive/70" />
              <span aria-hidden className="size-2.5 rounded-full bg-warning/70" />
              <span aria-hidden className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-2">{t("landing.demo.file")}</span>
            </div>
            <div className="space-y-0.5 px-4 py-4">
              <p className="text-muted-foreground"><span className="mr-3 select-none">12</span>function calc(a, b) {"{"}</p>
              <p className="bg-destructive/10 text-destructive"><span className="mr-3 select-none">−</span>function calc(a, b)</p>
              <p className="bg-success/10 text-success"><span className="mr-3 select-none">+</span>function calculateTotalPrice(items)</p>
              <div className="mt-4 rounded-md border bg-background p-3 font-sans text-sm leading-6">
                <p className="mb-1 font-display text-xs text-muted-foreground">linh · code review</p>
                <p>{t("landing.demo.comment")}</p>
                <p className="mt-2 font-display text-xs text-info">{t("landing.demo.meaning")}</p>
              </div>
            </div>
          </figure>
        </section>

        <section aria-labelledby="practice" className="pb-20">
          <SectionTitle id="practice">{t("landing.practice")}</SectionTitle>
          <ul className="divide-y border-y">
            {practice.map((p) => (
              <li key={p.title} className="grid gap-1 py-5 md:grid-cols-[14rem_1fr] md:gap-8">
                <h3 className="font-display text-base">{p.title}</h3>
                <p className="text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {!authed && <TryIt />}
      </main>
      <PublicFooter />
    </div>
  );
}
