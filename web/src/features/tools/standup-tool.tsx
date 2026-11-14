"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { renderStandup, VERBS, type Item } from "@/lib/toolkit/standup";
import { OutputPanel } from "./output-panel";

const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-44";

export function StandupTool() {
  const { t } = useI18n();
  const [yesterday, setYesterday] = useState<Item[]>([{ verb: "fix", object: "" }]);
  const [today, setToday] = useState<Item[]>([{ verb: "write", object: "" }]);
  const [blockers, setBlockers] = useState<string[]>([""]);
  const [noBlockers, setNoBlockers] = useState(false);

  const text = useMemo(() => renderStandup({ yesterday: yesterday.filter((i) => i.object.trim()), today: today.filter((i) => i.object.trim()), blockers, noBlockers }), [yesterday, today, blockers, noBlockers]);

  return (
    <AppShell>
      <Link href="/tools" className="text-sm text-muted-foreground underline underline-offset-4">{t("tools.back")}</Link>
      <h1 className="mb-8 mt-3 text-3xl sm:text-4xl">{t("tools.standup")}</h1>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-8">
          <ItemGroup title={t("standup.yesterday")} tip={t("standup.tip1")} items={yesterday} onChange={setYesterday} form="past" />
          <ItemGroup title={t("standup.today")} tip={t("standup.tip2")} items={today} onChange={setToday} form="base" />
          <fieldset className="space-y-3">
            <SectionTitleLegend>{t("standup.blockers")}</SectionTitleLegend>
            <p className="text-sm text-muted-foreground">{t("standup.tip3")}</p>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" className="size-5 accent-primary" checked={noBlockers} onChange={(e) => setNoBlockers(e.target.checked)} />
              {t("standup.noBlockers")}
            </label>
            {!noBlockers && blockers.map((b, i) => (
              <div key={i} className="flex gap-2">
                <Input value={b} placeholder={t("standup.blockerPh")} aria-label={t("standup.blockers")} onChange={(e) => setBlockers(blockers.map((x, j) => (j === i ? e.target.value : x)))} />
                {blockers.length > 1 && <Button type="button" variant="ghost" onClick={() => setBlockers(blockers.filter((_, j) => j !== i))}>{t("standup.remove")}</Button>}
              </div>
            ))}
            {!noBlockers && <Button type="button" variant="outline" size="sm" onClick={() => setBlockers([...blockers, ""])}>{t("standup.add")}</Button>}
          </fieldset>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OutputPanel text={text} />
        </div>
      </div>
    </AppShell>
  );
}

function ItemGroup({ title, tip, items, onChange, form }: { title: string; tip: string; items: Item[]; onChange: (i: Item[]) => void; form: "past" | "base" }) {
  const { t } = useI18n();
  const set = (i: number, patch: Partial<Item>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <fieldset className="space-y-3">
      <SectionTitleLegend>{title}</SectionTitleLegend>
      <p className="text-sm text-muted-foreground">{tip}</p>
      {items.map((item, i) => (
        <div key={i} className="grid gap-2 sm:flex">
          <select className={selectClass} aria-label={`${title}: ${t("standup.verb")}`} value={item.verb} onChange={(e) => set(i, { verb: e.target.value })}>
            {VERBS.map((v) => (
              <option key={v.base} value={v.base}>
                {form === "past" ? v.past : v.base} · {v.vi}
              </option>
            ))}
          </select>
          <Input value={item.object} placeholder={t("standup.object")} aria-label={`${title}: ${t("standup.object")}`} onChange={(e) => set(i, { object: e.target.value })} />
          {items.length > 1 && <Button type="button" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>{t("standup.remove")}</Button>}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { verb: items[items.length - 1]?.verb ?? "fix", object: "" }])}>{t("standup.add")}</Button>
    </fieldset>
  );
}

function SectionTitleLegend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-1 flex items-baseline gap-2 font-display text-base">
      <span aria-hidden className="text-primary">{"//"}</span>
      {children}
    </legend>
  );
}
