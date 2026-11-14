"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startSession, submitReview, type LearningSession, type Rating } from "@/lib/api/learning";
import { useI18n } from "@/lib/i18n/provider";
import { newId } from "@/lib/uuid";

export type FlashcardState =
  | { phase: "loading" }
  | { phase: "caught_up" }
  | { phase: "error"; error: unknown }
  | { phase: "card"; session: LearningSession; index: number; revealed: boolean; submitting: boolean; error: unknown | null; note: string | null; counts: Counts }
  | { phase: "done"; session: LearningSession; reviewed: number; counts: Counts };

export type Counts = Record<Rating, number>;
const NO_COUNTS: Counts = { again: 0, hard: 0, good: 0, easy: 0 };

export function useFlashcards(collection?: string, extra?: number) {
  const { t } = useI18n();
  const [state, setState] = useState<FlashcardState>({ phase: "loading" });
  // One request id per card shown. Re-using it on retry makes the submission idempotent on the server.
  const requestId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startSession(collection, extra)
      .then((session) => {
        if (cancelled) return;
        if (!session) return setState({ phase: "caught_up" });
        const index = session.items.findIndex((i) => !i.completed);
        setState(index === -1 ? { phase: "done", session, reviewed: session.total_items, counts: NO_COUNTS } : { phase: "card", session, index, revealed: false, submitting: false, error: null, note: null, counts: NO_COUNTS });
      })
      .catch((e) => !cancelled && setState({ phase: "error", error: e }));
    return () => {
      cancelled = true;
    };
  }, [collection, extra]);

  const reveal = useCallback(() => {
    setState((s) => (s.phase === "card" && !s.revealed ? { ...s, revealed: true } : s));
  }, []);

  const rate = useCallback(
    async (rating: Rating) => {
      if (state.phase !== "card" || !state.revealed || state.submitting) return;
      const { session, index, counts } = state;
      const item = session.items[index];
      setState({ ...state, submitting: true, error: null });
      try {
        const res = await submitReview({ word_id: item.word.id, rating, client_request_id: (requestId.current ??= newId()), session_item_id: item.id });
        requestId.current = null;
        const next = index + 1;
        const newCounts = { ...counts, [rating]: counts[rating] + 1 };
        const days = res.data.progress?.interval_days ?? 0;
        const note = `${t(`learn.${rating}`)}. ${rating === "again" || days < 1 ? t("learn.seeMinutes") : t("learn.seeDays", { count: days })}`;
        setState(
          next >= session.items.length
            ? { phase: "done", session, reviewed: session.items.length, counts: newCounts }
            : { phase: "card", session, index: next, revealed: false, submitting: false, error: null, note, counts: newCounts },
        );
      } catch (e) {
        setState({ ...state, submitting: false, error: e });
      }
    },
    [state, t],
  );

  return { state, reveal, rate };
}
