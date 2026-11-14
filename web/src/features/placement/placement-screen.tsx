"use client";

import Link from "next/link";
import { CEFR_LEVELS } from "@/lib/cefr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Preferences } from "@/components/layout/preferences";
import { useAuth } from "@/features/auth/auth-provider";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { updateMe } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { getPlacement, submitPlacement, type PlacementQuestion, type PlacementResult } from "@/lib/api/placement";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function PlacementScreen() {
  const { ready, user } = useRequireAuth({ allowUnonboarded: true });
  const { setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready) getPlacement().then(setQuestions, (e) => setError(errorMessage(e, t)));
  }, [ready, t]);

  if (!ready || !user) return null;
  const back = user.onboarded ? "/settings" : "/onboarding";

  async function submit() {
    if (!questions) return;
    if (questions.some((q) => picked[q.word_id] === undefined)) return setError(t("placement.answerAll"));
    setError(null);
    try {
      setResult(await submitPlacement(questions.map((q) => ({ word_id: q.word_id, choice_word_id: picked[q.word_id] }))));
    } catch (e) {
      setError(errorMessage(e, t));
    }
  }

  async function useLevel() {
    if (!result) return;
    try {
      const res = await updateMe({ level: result.suggested_level });
      setUser(res.user);
      router.replace(back);
    } catch (e) {
      setError(errorMessage(e, t));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-5 py-10 lg:px-10">
      <div className="flex justify-end"><Preferences /></div>
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl">{t("placement.title")}</h1>
        <p className="text-muted-foreground">{t("placement.sub")}</p>
      </div>

      {result ? (
        <section className="space-y-5" data-testid="placement-result">
          <p className="font-display text-2xl text-primary">{t("placement.result", { level: t(`level.${result.suggested_level}`) })}</p>
          <p className="text-muted-foreground">{t("placement.score", { n: result.score, total: result.total })}</p>
          <ul className="grid grid-cols-4 gap-2 text-center" aria-label={t("placement.byLevel")}>
            {CEFR_LEVELS.map((l) => (
              <li key={l} className={cn("rounded-lg border p-2", l === result.suggested_level && "border-primary bg-primary/5")}>
                <span className="block font-display text-sm">{l.toUpperCase()}</span>
                <span className="tnum block text-xs text-muted-foreground">{result.by_level[l]?.correct ?? 0}/{result.by_level[l]?.total ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">{t("placement.note")}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={useLevel}>{t("placement.use")}</Button>
            <Link href={back} className="grid h-11 place-items-center px-3 text-muted-foreground underline underline-offset-4">{t("placement.skip")}</Link>
          </div>
        </section>
      ) : (
        <>
          {!questions && !error && <p className="text-muted-foreground">{t("common.loading")}</p>}
          <ol className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
            {questions?.map((q, i) => (
              <li key={q.word_id}>
                <fieldset className="space-y-3">
                  <legend className="mb-1 flex items-baseline gap-3">
                    <span className="tnum font-display text-xs text-muted-foreground">{t("placement.of", { n: i + 1, total: questions.length })}</span>
                    <span className="font-display text-2xl">{q.term}</span>
                    {q.ipa && <span className="font-display text-sm text-muted-foreground">{q.ipa}</span>}
                  </legend>
                  <div className="grid gap-2">
                    {q.options.map((o) => (
                      <label key={o.word_id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50", picked[q.word_id] === o.word_id && "border-primary bg-primary/5")}>
                        <input type="radio" className="size-4 accent-primary" name={`q-${q.word_id}`} checked={picked[q.word_id] === o.word_id} onChange={() => setPicked((p) => ({ ...p, [q.word_id]: o.word_id }))} />
                        <span>{o.meaning_vi}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {questions && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={submit}>{t("placement.submit")}</Button>
              <Link href={back} className="grid h-11 place-items-center px-3 text-muted-foreground underline underline-offset-4">{t("placement.skip")}</Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
