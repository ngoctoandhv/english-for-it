"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { getPhrases, PHRASE_CATEGORIES, type Phrase, type PhraseCategory } from "@/lib/api/toolkit";
import { useI18n } from "@/lib/i18n/provider";
import { copyText } from "@/lib/toolkit/text";
import { cn } from "@/lib/utils";

export function PhraseBank() {
  const { t } = useI18n();
  const [category, setCategory] = useState<PhraseCategory>("pr_feedback");
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPhrases(category).then((p) => !cancelled && setPhrases(p)).catch((e) => !cancelled && setError(errorMessage(e, t)));
    return () => {
      cancelled = true;
    };
  }, [category, t]);

  async function copy(p: Phrase) {
    if (await copyText(p.text_en)) {
      setCopied(p.id);
      setTimeout(() => setCopied((c) => (c === p.id ? null : c)), 1500);
    }
  }

  return (
    <AppShell>
      <Link href="/tools" className="text-sm text-muted-foreground underline underline-offset-4">{t("tools.back")}</Link>
      <h1 className="mb-6 mt-3 text-3xl sm:text-4xl">{t("tools.phrases")}</h1>
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t("tools.phrases")}>
        {PHRASE_CATEGORIES.map((c) => (
          <button key={c} type="button" aria-pressed={category === c} onClick={() => { setPhrases(null); setCategory(c); }}
            className={cn("min-h-11 shrink-0 rounded-lg border bg-card px-4 text-[15px] hover:border-foreground/40", category === c && "border-primary bg-accent text-accent-foreground")}>
            {t(`phrases.cat.${c}`)}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {phrases?.length === 0 && <p className="text-muted-foreground">{t("phrases.none")}</p>}
      <ul className="grid grid-cols-1 border-t lg:grid-cols-2 lg:gap-x-12 [&>li]:min-w-0 [&>li]:border-b">
        {phrases?.map((p) => (
          <li key={p.id} className="flex items-start gap-2 py-3">
            <div className="min-w-0 flex-1">
              <p>{p.text_en}</p>
              <p className="text-sm text-muted-foreground">{p.text_vi}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={`${t("tools.play")}: ${p.text_en}`} onClick={() => playWord(p.text_en, p.audio_url)}><Volume2 aria-hidden /></Button>
            <Button variant="ghost" size="icon" aria-label={`${t("tools.copy")}: ${p.text_en}`} onClick={() => copy(p)}>
              {copied === p.id ? <Check aria-hidden className="text-success" /> : <Copy aria-hidden />}
            </Button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
