"use client";

import { Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { Button, buttonVariants } from "@/components/ui/button";
import { playWord } from "@/features/library/speak";
import { getSample, type PublicWord } from "@/lib/api/public";
import { useI18n } from "@/lib/i18n/provider";

/** Five real words to try before signing up. No account, nothing is stored. */
export function TryIt() {
  const { t } = useI18n();
  const [words, setWords] = useState<PublicWord[] | null>(null);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    getSample().then(setWords, () => setWords([]));
  }, []);

  if (!words || words.length === 0) return null;
  const word = words[index];
  const done = index >= words.length;

  return (
    <section aria-labelledby="try" className="pb-20">
      <SectionTitle id="try">{t("public.try")}</SectionTitle>
      <div className="max-w-xl rounded-lg border bg-card p-5 sm:p-6">
        {done ? (
          <div className="space-y-4">
            <p className="font-display text-xl">{t("public.tryDone")}</p>
            <Link href="/register" className={buttonVariants({ size: "lg" })}>{t("landing.cta")}</Link>
          </div>
        ) : (
          <div className="space-y-4" data-testid="try-card">
            <p className="tnum text-sm text-muted-foreground">{t("public.tryOf", { n: index + 1, total: words.length })}</p>
            <div className="flex items-center gap-1">
              <p className="break-words font-display text-4xl leading-none">{word.term}</p>
              <Button variant="ghost" size="icon" aria-label={t("lib.play", { term: word.term })} onClick={() => playWord(word.term, null)}><Volume2 aria-hidden /></Button>
            </div>
            <p className="font-display text-sm text-muted-foreground">{word.ipa} · {word.part_of_speech}</p>
            {shown ? (
              <div className="space-y-2">
                <p className="text-xl">{word.meaning_vi}</p>
                <p className="text-muted-foreground">{word.definition_en}</p>
                {word.example && <p className="border-l-2 border-primary pl-3 text-sm">{word.example.en}<span className="block text-muted-foreground">{word.example.vi}</span></p>}
                <Button size="lg" onClick={() => { setShown(false); setIndex((i) => i + 1); }}>{t("public.tryNext")}</Button>
              </div>
            ) : (
              <Button size="lg" variant="outline" onClick={() => setShown(true)}>{t("public.tryShow")}</Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
