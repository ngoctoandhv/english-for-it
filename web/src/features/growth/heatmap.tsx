"use client";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Day = { date: string; count: number };

function level(count: number): number {
  if (count <= 0) return 0;
  if (count < 4) return 1;
  if (count < 10) return 2;
  return 3;
}
const SHADE = ["bg-muted", "bg-primary/25", "bg-primary/55", "bg-primary"];

/** Contribution-style calendar. Columns are weeks (Monday first). Empty days are just empty. */
export function Heatmap({ days }: { days: Day[] }) {
  const { t } = useI18n();
  const first = new Date(`${days[0]?.date}T00:00:00Z`).getUTCDay();
  const lead = (first + 6) % 7; // Monday = 0
  const total = days.reduce((n, d) => n + d.count, 0);

  return (
    <div>
      <div
        role="img"
        aria-label={`${t("growth.calendar")}: ${t("growth.total", { n: days.filter((d) => d.count > 0).length })}, ${total}`}
        className="grid grid-flow-col grid-rows-7 gap-[3px]"
        style={{ gridAutoColumns: "minmax(0, 1fr)" }}
      >
        {Array.from({ length: lead }, (_, i) => <span key={`pad-${i}`} aria-hidden />)}
        {days.map((d) => (
          <span
            key={d.date}
            title={t("growth.cellDay", { date: d.date, count: d.count })}
            className={cn("aspect-square rounded-[3px]", SHADE[level(d.count)])}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground" aria-hidden>
        {t("growth.legend")}
        {SHADE.map((s) => <span key={s} className={cn("size-3 rounded-[3px]", s)} />)}
        {t("growth.legendMore")}
      </div>
    </div>
  );
}
