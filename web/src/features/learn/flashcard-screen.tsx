"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { PlayButton } from "@/features/library/play-button";
import { playWord } from "@/features/library/speak";
import { cn } from "@/lib/utils";
import { actionForKey, RATINGS } from "./keys";
import { useFlashcards } from "./use-flashcards";

const RATING_STYLE: Record<string, string> = {
  again: "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10",
  hard: "border-warning/40 bg-warning/5 text-warning hover:bg-warning/10",
  good: "shadow-md shadow-primary/25",
  easy: "border-success/40 bg-success/5 text-success hover:bg-success/10",
};

export function FlashcardScreen() {
  const { ready } = useRequireAuth();
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-soft/60 to-background">
      <header className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 py-4">
        <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
          Exit
        </Link>
        {card && (
          <Progress
            value={(card.index / card.session.items.length) * 100}
            aria-label={`Card ${card.index + 1} of ${card.session.items.length}`}
            className="flex-1"
          />
        )}
        {card && (
          <span className="text-sm tabular-nums text-muted-foreground">
            {card.index + 1}/{card.session.items.length}
          </span>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 pb-10">
        {state.phase === "loading" && <p className="text-center text-muted-foreground">Preparing your session…</p>}
        {state.phase === "error" && <p role="alert" className="text-center text-destructive">{state.message}</p>}
        {state.phase === "caught_up" && (
          <Message title="You're all caught up" text="Nothing is due right now. Come back later, there's no rush.">
            <Link href="/" className={buttonVariants()}>Back to today</Link>
          </Message>
        )}
        {state.phase === "done" && (
          <Message title="Session complete" text={`You reviewed ${state.reviewed} ${state.reviewed === 1 ? "card" : "cards"}. See you next time.`}>
            <Link href="/" className={buttonVariants()}>Back to today</Link>
          </Message>
        )}

        {card && word && (
          <>
            <section aria-live="polite" className="space-y-6 rounded-3xl border bg-card p-8 text-center shadow-lg shadow-primary/5 sm:p-12">
              <p className="mx-auto w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">{card.session.items[card.index].kind === "new" ? "New word" : "Review"}</p>
              <div className="flex items-center justify-center gap-1">
                <h1 data-testid="card-term" className="text-5xl font-semibold tracking-tight sm:text-6xl">{word.term}</h1>
                <PlayButton term={word.term} audioUrl={word.audio_url} />
              </div>
              <p className="text-lg text-muted-foreground">{word.ipa} · <span className="italic">{word.part_of_speech}</span></p>

              {card.revealed && (
                <div className="space-y-4 border-t pt-6 text-left" data-testid="card-answer">
                  <p className="text-center text-3xl font-medium tracking-tight">{word.meaning_vi}</p>
                  <p className="text-center text-muted-foreground">{word.definition_en}</p>
                  {word.examples[0] && (
                    <blockquote className="rounded-lg bg-muted/60 p-3 pl-4">
                      <p>{word.examples[0].sentence_en}</p>
                      <p className="text-sm text-muted-foreground">{word.examples[0].translation_vi}</p>
                    </blockquote>
                  )}
                  {word.collocations.length > 0 && (
                    <p className="text-sm text-muted-foreground">Often used: {word.collocations.map((c) => c.phrase).join(" · ")}</p>
                  )}
                </div>
              )}
            </section>

            {card.error && <p role="alert" className="text-center text-sm text-destructive">{card.error}</p>}

            {!card.revealed ? (
              <Button size="lg" className="mx-auto h-12 w-full max-w-xs" onClick={reveal}>
                Show answer <kbd className="ml-2 hidden rounded border px-1.5 text-xs sm:inline">Space</kbd>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you remember?">
                {RATINGS.map((r) => (
                  <Button
                    key={r.rating}
                    variant={r.rating === "good" ? "default" : "outline"}
                    size="lg"
                    className={cn("h-12 text-base", RATING_STYLE[r.rating])}
                    disabled={card.submitting}
                    onClick={() => rate(r.rating)}
                  >
                    {r.label} <kbd className="ml-2 hidden rounded border px-1.5 text-xs sm:inline">{r.key}</kbd>
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Message({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
