"use client";

import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { ProgressRing } from "@/components/ui/progress-ring";
import { errorMessage } from "@/lib/api/errors";
import { getPath, type PathOverview, type PathUnit } from "@/lib/api/path";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function PathScreen() {
  const { t } = useI18n();
  const [path, setPath] = useState<PathOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPath().then(setPath).catch((e) => setError(errorMessage(e, t)));
  }, [t]);

  return (
    <AppShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("path.title")}</h1>
      <p className="mb-10 max-w-prose text-muted-foreground">{t("path.sub")}</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {path && path.levels.every((l) => l.units.length === 0) && <p className="text-muted-foreground">{t("path.empty")}</p>}
      <div className="space-y-12">
        {path?.levels.filter((l) => l.units.length > 0).map((l) => (
          <section key={l.level} aria-labelledby={`lvl-${l.level}`} className="max-w-3xl">
            <SectionTitle id={`lvl-${l.level}`}>{t(`path.level.${l.level}`)}</SectionTitle>
            <ol className="divide-y border-y">
              {l.units.map((u, i) => (
                <UnitRow key={u.slug} unit={u} index={i + 1} next={path.next_up?.unit === u.slug} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

function UnitRow({ unit, index, next }: { unit: PathUnit; index: number; next: boolean }) {
  const { t } = useI18n();
  const locked = unit.status === "locked";
  const pct = unit.steps_total ? (unit.steps_done / unit.steps_total) * 100 : 0;
  return (
    <li>
      <Link
        href={`/path/${unit.slug}`}
        aria-label={`${unit.title}: ${t(`path.status.${unit.status}`)}`}
        className={cn("flex items-center gap-4 py-4 hover:bg-muted/50 sm:px-2", locked && "text-muted-foreground")}
      >
        <ProgressRing value={unit.status === "completed" ? 100 : pct} label={t("path.stepsDone", { done: unit.steps_done, total: unit.steps_total })}>
          {unit.status === "completed" ? <Check className="size-4 text-primary" aria-hidden /> : locked ? <Lock className="size-3.5" aria-hidden /> : index}
        </ProgressRing>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base">{unit.title}{unit.recommended && <span className="ml-2 rounded border border-primary/40 px-1.5 py-0.5 align-middle text-[11px] text-primary">{t("path.forYou")}</span>}</span>
          <span className="block truncate text-sm text-muted-foreground">{unit.description}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className={cn("block font-display text-xs", unit.status === "completed" && "text-success", next && "text-primary")}>{t(`path.status.${unit.status}`)}</span>
          <span className="tnum block font-display text-xs text-muted-foreground">{t("path.stepsDone", { done: unit.steps_done, total: unit.steps_total })}</span>
        </span>
      </Link>
    </li>
  );
}
