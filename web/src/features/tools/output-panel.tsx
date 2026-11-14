"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { useI18n } from "@/lib/i18n/provider";
import { copyText } from "@/lib/toolkit/text";

/** The generated message with Copy and Listen. Plain text so it can be pasted anywhere. */
export function OutputPanel({ text, subject }: { text: string; subject?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const full = subject ? `Subject: ${subject}\n\n${text}` : text;

  async function copy() {
    if (await copyText(full)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <section aria-labelledby="out" className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-muted px-4 py-2">
        <h2 id="out" className="font-display text-sm">{t("tools.output")}</h2>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={!text} onClick={() => playWord(text.replace(/^- /gm, ""), null)}>
            <Volume2 aria-hidden /> {t("tools.play")}
          </Button>
          <Button type="button" size="sm" disabled={!text} onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />} <span aria-live="polite">{copied ? t("tools.copied") : t("tools.copy")}</span>
          </Button>
        </div>
      </div>
      <div className="px-4 py-4">
        {text ? (
          <>
            {subject && <p className="mb-3 font-display text-sm"><span className="text-muted-foreground">{t("email.subject")}: </span>{subject}</p>}
            <p data-testid="tool-output" className="whitespace-pre-line leading-7">{text}</p>
            <p className="mt-4 text-sm text-muted-foreground">{t("tools.checkNote")}</p>
          </>
        ) : (
          <p className="text-muted-foreground">{t("tools.empty")}</p>
        )}
      </div>
    </section>
  );
}
