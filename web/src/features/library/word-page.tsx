"use client";

import { Volume2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { SectionTitle } from "@/components/layout/section-title";
import { getWord, type WordDetail } from "@/lib/api/vocabulary";
import { FavoriteButton } from "./favorite-button";
import { PlayButton } from "./play-button";

export function WordPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [word, setWord] = useState<WordDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWord(id).then(setWord).catch((e) => setError(errorMessage(e, t)));
  }, [id, t]);

  return (
    <AppShell>
      <Link href="/library" className="text-sm text-muted-foreground underline underline-offset-4">
        ← {t("lib.title")}
      </Link>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {word && (
        <article className="mt-4 max-w-2xl space-y-6">
          <header>
            <div className="flex items-center gap-1">
              <h1 className="break-words text-4xl leading-none sm:text-6xl">{word.term}</h1>
              <PlayButton term={word.term} audioUrl={word.audio_url} />
              <FavoriteButton wordId={word.id} initial={word.favorited} />
            </div>
            <p className="font-display text-sm text-muted-foreground">
              {word.ipa} · {word.part_of_speech}
              {word.category && ` · ${word.category.name}`}
            </p>
          </header>
          <section>
            <p className="text-xl">{word.meaning_vi}</p>
            <p className="text-muted-foreground">{word.definition_en}</p>
          </section>
          {word.examples.length > 0 && (
            <section>
              <SectionTitle>{t("lib.examples")}</SectionTitle>
              <ul className="space-y-3">
                {word.examples.map((e) => (
                  <li key={e.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <p>{e.sentence_en}</p>
                      <p className="text-sm text-muted-foreground">{e.translation_vi}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label={t("learn.playExample")} onClick={() => playWord(e.sentence_en, e.audio_url)}>
                      <Volume2 aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {word.collocations.length > 0 && (
            <section>
              <SectionTitle>{t("lib.collocations")}</SectionTitle>
              <ul className="flex flex-wrap gap-2">
                {word.collocations.map((c) => (
                  <li key={c.id} className="rounded border px-2 py-1 font-display text-xs">
                    {c.phrase}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </AppShell>
  );
}
