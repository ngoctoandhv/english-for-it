"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { useI18n } from "@/lib/i18n/provider";

export function PracticeScreen() {
  const { t } = useI18n();
  const items = [
    { href: "/library", title: t("nav.vocabulary"), text: t("dash.vocab") },
    { href: "/listening", title: t("nav.listening"), text: t("dash.listening") },
    { href: "/scenarios", title: t("nav.scenarios"), text: t("dash.scenarios") },
    { href: "/quiz", title: t("dash.quiz"), text: t("dash.quizText") },
  ];
  return (
    <AppShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("practice.title")}</h1>
      <p className="mb-10 max-w-prose text-muted-foreground">{t("practice.sub")}</p>
      <section aria-labelledby="free" className="">
        <SectionTitle id="free">{t("nav.practice")}</SectionTitle>
        <ul className="grid grid-cols-1 border-t lg:grid-cols-2 lg:gap-x-12 [&>li]:min-w-0 [&>li]:border-b">
          {items.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="grid gap-1 py-4 hover:bg-muted/50 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:px-2">
                <span className="font-display">{p.title}</span>
                <span className="text-muted-foreground">{p.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
