"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { importWords, type ImportResult } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";

const TEMPLATE = "term,part_of_speech,ipa,meaning_vi,definition_en,category,example_en,example_vi,collocations\n";

export function WordImport() {
  const { t } = useI18n();
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(dryRun: boolean) {
    setBusy(true);
    setError(null);
    try {
      setResult(await importWords(csv, dryRun));
    } catch (e) {
      setError(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setCsv(await file.text());
    setResult(null);
  }

  const ok = result && result.errors.length === 0;
  return (
    <AppShell admin>
      <Link href="/admin/words" className="text-sm text-muted-foreground underline underline-offset-4">← {t("admin.res.words")}</Link>
      <h1 className="mb-3 mt-3 text-3xl sm:text-4xl">{t("admin.importTitle")}</h1>
      <div className="max-w-3xl space-y-5">
        <p className="text-muted-foreground">{t("admin.importHelp")}</p>
        <a download="words-template.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`} className="text-sm text-primary underline underline-offset-4">{t("admin.importTemplate")}</a>
        <div className="space-y-1.5">
          <label htmlFor="csv-file" className="text-sm font-medium">{t("admin.importFile")}</label>
          <input id="csv-file" type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="csv-text" className="text-sm font-medium">{t("admin.importPaste")}</label>
          <Textarea id="csv-text" value={csv} onChange={(e) => { setCsv(e.target.value); setResult(null); }} rows={10} className="font-display text-xs" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => run(true)} disabled={busy || !csv.trim()}>{t("admin.importCheck")}</Button>
          <Button onClick={() => run(false)} disabled={busy || !csv.trim()}>{t("admin.importRun")}</Button>
        </div>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {result && ok && <p role="status" className="text-primary">{t(result.dry_run ? "admin.importChecked" : "admin.importOk", { created: result.created, updated: result.updated })}</p>}
        {result && !ok && (
          <ul role="alert" className="space-y-1 text-sm text-destructive">
            {result.errors.map((e, i) => <li key={i}>{t("admin.importRow", { row: e.row, message: e.message })}</li>)}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
