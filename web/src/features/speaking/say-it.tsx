"use client";

import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { compareSpeech } from "@/lib/speaking/compare";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { speechSupport, useSpeechPractice } from "./use-speech-practice";

/** Record yourself saying a line, hear it back next to the model, and see which words a speech engine caught. */
export function SayIt({ text, audioUrl }: { text: string; audioUrl: string | null }) {
  const { t } = useI18n();
  const { phase, heard, audioUrl: mine, error, start, stop, reset } = useSpeechPractice();
  const support = speechSupport();
  const result = phase === "done" && heard ? compareSpeech(text, heard) : null;

  return (
    <div className="mt-3 space-y-3 rounded-md border border-dashed p-3" data-testid="say-it">
      <p className="font-display text-xs text-muted-foreground">{t("say.title")}</p>

      {phase === "idle" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={start}><Mic aria-hidden /> {t("say.record")}</Button>
          <Button size="sm" variant="outline" onClick={() => playWord(text, audioUrl)}>{t("say.model")}</Button>
        </div>
      )}

      {phase === "listening" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="destructive" onClick={stop}><Square aria-hidden /> {t("say.stop")}</Button>
          <p role="status" className="text-sm text-muted-foreground">{t("say.listening")}</p>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-3">
          {result ? (
            <>
              <p className="font-display text-sm text-primary" data-testid="say-score">{t("say.score", { n: result.score })}</p>
              <p className="leading-relaxed" aria-label={t("say.heard", { text: heard })}>
                {result.words.map((w, i) => (
                  <span key={i} className={cn("mr-1.5", w.ok ? "text-foreground" : "text-destructive underline decoration-wavy underline-offset-4")}>{w.word}</span>
                ))}
              </p>
              {result.extra.length > 0 && <p className="text-sm text-muted-foreground">{t("say.extra", { words: result.extra.join(", ") })}</p>}
              {result.score < 100 && <p className="text-sm text-muted-foreground">{t("say.missed")}</p>}
              <p className="text-sm text-muted-foreground">{t("say.heard", { text: heard })}</p>
            </>
          ) : support.recognise ? (
            <p role="status" className="text-sm text-muted-foreground">{t("say.nothing")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("say.shadow")}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => playWord(text, audioUrl)}>{t("say.model")}</Button>
            {mine && <audio src={mine} controls aria-label={t("say.you")} className="h-9 max-w-full" />}
            <Button size="sm" variant="ghost" onClick={reset}>{t("say.again")}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("say.note")}</p>
        </div>
      )}

      {error === "denied" && <p role="alert" className="text-sm text-destructive">{t("say.denied")}</p>}
      {error === "unsupported" && <p role="alert" className="text-sm text-muted-foreground">{t("say.unsupported")}</p>}
    </div>
  );
}
