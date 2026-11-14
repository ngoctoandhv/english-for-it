"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { useI18n } from "@/lib/i18n/provider";

const TOOLS = ["standup", "incident", "email", "phrases"] as const;

export function ToolsHub() {
  const { t } = useI18n();
  return (
    <AppShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("tools.title")}</h1>
      <p className="mb-10 max-w-prose text-muted-foreground">{t("tools.sub")}</p>
      <section aria-labelledby="tools" className="">
        <SectionTitle id="tools">{t("nav.tools")}</SectionTitle>
        <ul className="grid grid-cols-1 border-t lg:grid-cols-2 lg:gap-x-12 [&>li]:min-w-0 [&>li]:border-b">
          {TOOLS.map((k) => (
            <li key={k}>
              <Link href={`/tools/${k}`} className="grid gap-1 py-4 hover:bg-muted/50 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:px-2">
                <span className="font-display">{t(`tools.${k}`)}</span>
                <span className="text-muted-foreground">{t(`tools.${k}.text`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
