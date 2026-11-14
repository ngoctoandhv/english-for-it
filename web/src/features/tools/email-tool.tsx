"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { EMAIL_TEMPLATES } from "@/lib/toolkit/email";
import { OutputPanel } from "./output-panel";

const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function EmailTool() {
  const { t } = useI18n();
  const [key, setKey] = useState(EMAIL_TEMPLATES[0].key);
  const [values, setValues] = useState<Record<string, string>>({});
  const template = EMAIL_TEMPLATES.find((x) => x.key === key)!;
  const out = useMemo(() => template.render(values), [template, values]);

  return (
    <AppShell>
      <Link href="/tools" className="text-sm text-muted-foreground underline underline-offset-4">{t("tools.back")}</Link>
      <h1 className="mb-8 mt-3 text-3xl sm:text-4xl">{t("tools.email")}</h1>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="template">{t("email.template")}</Label>
            <select id="template" className={selectClass} value={key} onChange={(e) => setKey(e.target.value)}>
              {EMAIL_TEMPLATES.map((x) => <option key={x.key} value={x.key}>{t(`email.t.${x.key}`)}</option>)}
            </select>
          </div>
          {template.fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={`f-${f.name}`}>{t(`email.f.${f.name}`)}</Label>
              {f.textarea ? (
                <Textarea id={`f-${f.name}`} rows={4} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : (
                <Input id={`f-${f.name}`} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
        </form>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OutputPanel text={out.body} subject={out.subject} />
        </div>
      </div>
    </AppShell>
  );
}
