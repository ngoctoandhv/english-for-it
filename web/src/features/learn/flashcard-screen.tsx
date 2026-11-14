"use client";

import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Preferences } from "@/components/layout/preferences";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { actionForKey, RATINGS } from "./keys";
import { useFlashcards } from "./use-flashcards";

const RATING_STYLE: Record<string, string> = {
  again: "text-destructive",
  hard: "text-warning",
  good: "",
  easy: "text-success",
};

export function FlashcardScreen() {
  const { ready } = useRequireAuth();
  const { t } = useI18n();
  const { state, reveal, rate } = useFlashcards();

  const card = state.phase === "card" ? state : null;
  const word = card ? card.session.items[card.index].word : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const action = actionForKey(e.key, !!card?.revealed);
      if (!action || !card || !word) return;
      e.preventDefault();
      if (action.type === "reveal") reveal();
      else if (action.type === "rate") void rate(action.rating);
      else playWord(word.term, word.audio_url);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, word, reveal, rate]);

  if (!ready) return null;

  const example = word?.examples[0];
  const total = card?.session.items.length ?? 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="inline-flex min-h-10 items-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> {t("learn.exit")}
          </Link>
          {card && <Progress value={(card.index / total) * 100} aria-label={t("learn.cardOf", { n: card.index + 1, total })} className="flex-1" />}
          {!card && <div className="flex-1" />}
          <Preferences />
        </div>
      </header>

      <main className={cn("mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-6 sm:px-6 sm:py-10", card?.revealed ? "pb-36 sm:pb-10" : "pb-28 sm:pb-10")}>
        {state.phase === "loading" && <p className="text-center text-muted-foreground">{t("learn.preparing")}</p>}
        {state.phase === "error" && <p role="alert" className="text-center text-destructive">{errorMessage(state.error, t)}</p>}
        {state.phase === "caught_up" && (
          <Message title={t("learn.caughtUp")} text={t("learn.caughtUpText")}>
            <Link href="/" className={buttonVariants({ size: "lg" })}>{t("learn.backToday")}</Link>
          </Message>
        )}
        {state.phase === "done" && (
          <Message title={t("learn.done")} text={t("learn.reviewed", { count: state.reviewed })}>
            <dl className="mx-auto w-full max-w-xs divide-y border-y text-left">
              {RATINGS.map((r) => (
                <div key={r.rating} className="flex justify-between py-2.5">
                  <dt className={cn("text-muted-foreground", RATING_STYLE[r.rating])}>{t(`learn.${r.rating}`)}</dt>
                  <dd className="tnum font-display">{state.counts[r.rating]}</dd>
                </div>
              ))}
            </dl>
            <Link href="/" className={buttonVariants({ size: "lg" })}>{t("learn.backToday")}</Link>
          </Message>
        )}

        {card && word && (
          <>
            <p className="min-h-5 text-center text-sm text-muted-foreground" aria-live="polite">{card.note}</p>
            <section aria-live="polite" className="overflow-hidden rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b bg-muted px-4 py-2 font-display text-xs text-muted-foreground">
                <span className="tnum">{pad(card.index + 1)}/{pad(total)}</span>
                <span className={cn("rounded border px-1.5 py-0.5", card.session.items[card.index].kind === "new" ? "border-primary/40 text-primary" : "")}>
                  {card.session.items[card.index].kind === "new" ? t("learn.newWord") : t("learn.review")}
                </span>
              </div>
              <div className="space-y-4 px-5 py-8 text-center sm:px-10 sm:py-12">
                <div className="flex items-center justify-center gap-1">
                  <h1 data-testid="card-term" className="break-words text-4xl leading-none sm:text-6xl">{word.term}</h1>
                  <Button variant="ghost" size="icon" aria-label={t("learn.playWord", { term: word.term })} onClick={() => playWord(word.term, word.audio_url)}>
                    <Volume2 aria-hidden />
                  </Button>
                </div>
                <p className="font-display text-base text-muted-foreground">{word.ipa} · {word.part_of_speech}</p>
              </div>

              {card.revealed && (
                <div className="space-y-5 border-t px-5 py-6 sm:px-10" data-testid="card-answer">
                  <p className="text-center text-2xl font-medium tracking-tight sm:text-3xl">{word.meaning_vi}</p>
                  <p className="text-center text-muted-foreground">{word.definition_en}</p>
                  {example && (
                    <div className="flex items-start gap-2 rounded-md bg-muted p-3">
                      <div className="flex-1">
                        <p>{example.sentence_en}</p>
                        <p className="text-sm text-muted-foreground">{example.translation_vi}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" aria-label={t("learn.playExample")} onClick={() => playWord(example.sentence_en, example.audio_url)}>
                        <Volume2 aria-hidden />
                      </Button>
                    </div>
                  )}
                  {word.collocations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{t("learn.often")}</span>
                      {word.collocations.map((c) => (
                        <span key={c.id} className="rounded border px-2 py-0.5 font-display text-xs">{c.phrase}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {card.error != null && (
              <p role="alert" className="text-center text-sm text-destructive">{errorMessage(card.error, t)} {t("learn.notSaved")}</p>
            )}

            <div className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t bg-background px-4 py-3 sm:static sm:border-0 sm:bg-transparent sm:p-0">
              {!card.revealed ? (
                <Button size="lg" className="mx-auto flex h-12 w-full max-w-xs" onClick={reveal}>
                  {t("learn.show")} <kbd className="ml-1 hidden text-sm opacity-70 sm:inline">Space</kbd>
                </Button>
              ) : (
                <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2" role="group" aria-label={t("learn.howWell")}>
                  {RATINGS.map((r) => (
                    <Button
                      key={r.rating}
                      variant={r.rating === "good" ? "default" : "outline"}
                      size="lg"
                      className={cn("h-14 flex-col gap-0 px-1 text-sm sm:h-12 sm:flex-row sm:gap-1 sm:text-base", RATING_STYLE[r.rating])}
                      disabled={card.submitting}
                      onClick={() => rate(r.rating)}
                    >
                      {t(`learn.${r.rating}`)}
                      <kbd className="text-xs opacity-60">{r.key}</kbd>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Message({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <p className="text-lg text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
