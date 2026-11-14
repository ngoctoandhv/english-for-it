"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";
import { renderIncident, type IncidentInput, type IncidentStatus } from "@/lib/toolkit/incident";
import { cn } from "@/lib/utils";
import { OutputPanel } from "./output-panel";

const STATUSES: IncidentStatus[] = ["investigating", "identified", "monitoring", "resolved"];

export function IncidentTool() {
  const { t } = useI18n();
  const [v, setV] = useState<IncidentInput>({ status: "investigating", service: "", scope: "some", impact: "", cause: "", eta: "", next: "" });
  const set = (patch: Partial<IncidentInput>) => setV((cur) => ({ ...cur, ...patch }));
  const text = useMemo(() => renderIncident(v), [v]);

  const show = {
    impact: v.status === "investigating",
    cause: v.status === "identified" || v.status === "resolved",
    eta: v.status === "identified",
    next: v.status !== "resolved",
  };

  return (
    <AppShell>
      <Link href="/tools" className="text-sm text-muted-foreground underline underline-offset-4">{t("tools.back")}</Link>
      <h1 className="mb-8 mt-3 text-3xl sm:text-4xl">{t("tools.incident")}</h1>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <p className="text-muted-foreground">{t("incident.tip")}</p>
          <fieldset>
            <legend className="mb-2 font-display text-base">{t("incident.status")}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group">
              {STATUSES.map((s) => (
                <button key={s} type="button" aria-pressed={v.status === s} onClick={() => set({ status: s })}
                  className={cn("min-h-11 rounded-lg border bg-card px-2 text-sm hover:border-foreground/40", v.status === s && "border-primary bg-accent text-accent-foreground")}>
                  {t(`incident.s.${s}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <Field id="service" label={t("incident.service")} value={v.service} placeholder="the payment service" onChange={(x) => set({ service: x })} />
          {show.impact && (
            <>
              <fieldset>
                <legend className="mb-2 font-display text-base">{t("incident.scope")}</legend>
                <div className="grid grid-cols-2 gap-2" role="group">
                  {(["some", "all"] as const).map((s) => (
                    <button key={s} type="button" aria-pressed={v.scope === s} onClick={() => set({ scope: s })}
                      className={cn("min-h-11 rounded-lg border bg-card px-2 text-sm hover:border-foreground/40", v.scope === s && "border-primary bg-accent text-accent-foreground")}>
                      {t(`incident.scope.${s}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Field id="impact" label={t("incident.impact")} value={v.impact} placeholder="check out" onChange={(x) => set({ impact: x })} />
            </>
          )}
          {show.cause && <Field id="cause" label={t("incident.cause")} value={v.cause} placeholder="the database server ran out of storage" onChange={(x) => set({ cause: x })} />}
          {show.eta && <Field id="eta" label={t("incident.eta")} value={v.eta} placeholder="within 30 minutes" onChange={(x) => set({ eta: x })} />}
          {show.next && <Field id="next" label={t("incident.next")} value={v.next} placeholder="at 10:00" onChange={(x) => set({ next: x })} />}
        </form>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OutputPanel text={text} />
        </div>
      </div>
    </AppShell>
  );
}

function Field({ id, label, value, placeholder, onChange }: { id: string; label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
