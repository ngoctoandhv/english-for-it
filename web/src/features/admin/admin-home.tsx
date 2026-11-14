"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { useI18n } from "@/lib/i18n/provider";
import { RESOURCES } from "./resources";

export function AdminHome() {
  const { t } = useI18n();
  return (
    <AppShell admin>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("admin.title")}</h1>
      <p className="mb-10 max-w-prose text-muted-foreground">{t("admin.sub")}</p>
      <section aria-labelledby="content" className="max-w-3xl">
        <SectionTitle id="content">{t("nav.admin")}</SectionTitle>
        <ul className="divide-y border-y">
          {RESOURCES.map((r) => (
            <li key={r.key}>
              <Link href={`/admin/${r.key}`} className="grid gap-1 py-4 hover:bg-muted/50 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:px-2">
                <span className="font-display">{t(`admin.res.${r.key}`)}</span>
                <span className="text-muted-foreground">{t(`admin.res.${r.key}.text`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
