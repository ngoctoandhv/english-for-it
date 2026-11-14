"use client";

import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { playWord } from "@/features/library/speak";
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-2xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Exit
        </Link>
        {card && (
          <>
            <Progress value={(card.index / card.session.items.length) * 100} aria-label={`Card ${card.index + 1} of ${card.session.items.length}`} className="flex-1" />
            <span className="tnum text-sm text-muted-foreground">
              {card.index + 1} of {card.session.items.length}
            </span>
          </>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 pb-12 sm:px-6">
        {state.phase === "loading" && <p className="text-center text-muted-foreground">Preparing your session…</p>}
        {state.phase === "error" && <p role="alert" className="text-center text-destructive">{state.message}</p>}
        {state.phase === "caught_up" && (
          <Message title="All caught up" text="Nothing is due right now. Come back later.">
            <Link href="/" className={buttonVariants({ size: "lg" })}>Back to today</Link>
          </Message>
        )}
        {state.phase === "done" && (
          <Message title="Session complete" text={`You reviewed ${state.reviewed} ${state.reviewed === 1 ? "card" : "cards"}.`}>
            <dl className="mx-auto w-full max-w-xs divide-y border-y text-left">
              {RATINGS.map((r) => (
                <div key={r.rating} className="flex justify-between py-2.5">
                  <dt className={cn("text-muted-foreground", RATING_STYLE[r.rating])}>{r.label}</dt>
                  <dd className="tnum font-medium">{state.counts[r.rating]}</dd>
                </div>
              ))}
            </dl>
            <Link href="/" className={buttonVariants({ size: "lg" })}>Back to today</Link>
          </Message>
        )}

        {card && word && (
          <>
            <p className="min-h-6 text-center text-sm text-muted-foreground" aria-live="polite">{card.note}</p>
            <section aria-live="polite" className="space-y-6 rounded-xl border bg-card px-6 py-10 text-center sm:px-12 sm:py-14">
              <p className="text-sm text-muted-foreground">{card.session.items[card.index].kind === "new" ? "New word" : "Review"}</p>
              <div className="flex items-center justify-center gap-2">
                <h1 data-testid="card-term" className="text-6xl leading-none sm:text-7xl">{word.term}</h1>
                <Button variant="ghost" size="icon" aria-label={`Play pronunciation of ${word.term}`} onClick={() => playWord(word.term, word.audio_url)}>
                  <Volume2 aria-hidden />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground">{word.ipa} · {word.part_of_speech}</p>

              {card.revealed && (
                <div className="space-y-5 border-t pt-8 text-left" data-testid="card-answer">
                  <p className="text-center text-3xl font-medium tracking-tight">{word.meaning_vi}</p>
                  <p className="text-center text-muted-foreground">{word.definition_en}</p>
                  {example && (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p>{example.sentence_en}</p>
                        <p className="text-sm text-muted-foreground">{example.translation_vi}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" aria-label="Play example sentence" onClick={() => playWord(example.sentence_en, example.audio_url)}>
                        <Volume2 aria-hidden />
                      </Button>
                    </div>
                  )}
                  {word.collocations.length > 0 && (
                    <p className="text-sm text-muted-foreground">Often used: {word.collocations.map((c) => c.phrase).join(", ")}</p>
                  )}
                </div>
              )}
            </section>

            {card.error && <p role="alert" className="text-center text-sm text-destructive">{card.error}</p>}

            {!card.revealed ? (
              <Button size="lg" className="mx-auto h-12 w-full max-w-xs" onClick={reveal}>
                Show answer <kbd className="ml-1 hidden text-sm opacity-70 sm:inline">Space</kbd>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you remember?">
                {RATINGS.map((r) => (
                  <Button
                    key={r.rating}
                    variant={r.rating === "good" ? "default" : "outline"}
                    size="lg"
                    className={cn("h-12", RATING_STYLE[r.rating])}
                    disabled={card.submitting}
                    onClick={() => rate(r.rating)}
                  >
                    {r.label} <kbd className="ml-1 hidden text-sm opacity-60 sm:inline">{r.key}</kbd>
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
    <div className="space-y-6 text-center">
      <h1 className="text-5xl">{title}</h1>
      <p className="text-lg text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
