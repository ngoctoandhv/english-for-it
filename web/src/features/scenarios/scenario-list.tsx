"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { getScenarios, type ScenarioSummary } from "@/lib/api/scenarios";

export function ScenarioList() {
  const { t } = useI18n();
  const [items, setItems] = useState<ScenarioSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScenarios().then(setItems).catch((e) => setError(errorMessage(e, t)));
  }, [t]);

  return (
    <AppShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("scen.title")}</h1>
      <p className="mb-6 text-muted-foreground">{t("scen.sub")}</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {items?.length === 0 && <p className="text-muted-foreground">{t("scen.none")}</p>}
      <ul className="divide-y border-y">
        {items?.map((s) => (
          <li key={s.id}>
            <Link href={`/scenarios/${s.slug}`} className="flex items-center justify-between gap-3 px-1 py-4 hover:bg-muted/50 sm:px-2">
              <span>
                <span className="block font-display text-base">{s.title}</span>
                <span className="block text-sm text-muted-foreground">{s.description}</span>
              </span>
              <span className="shrink-0 text-right text-sm text-muted-foreground">
                <span className="block font-display text-xs">{t(`level.${s.level}`)}</span>
                {s.completed && <span className="block font-display text-xs text-success">{t("scen.completed")}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
