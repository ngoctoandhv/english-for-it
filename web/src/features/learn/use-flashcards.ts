"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import { startSession, submitReview, type LearningSession, type Rating } from "@/lib/api/learning";
import { newId } from "@/lib/uuid";

export type FlashcardState =
  | { phase: "loading" }
  | { phase: "caught_up" }
  | { phase: "error"; message: string }
  | { phase: "card"; session: LearningSession; index: number; revealed: boolean; submitting: boolean; error: string | null }
  | { phase: "done"; session: LearningSession; reviewed: number };

export function useFlashcards() {
  const [state, setState] = useState<FlashcardState>({ phase: "loading" });
  // One request id per card shown. Re-using it on retry makes the submission idempotent on the server.
  const requestId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startSession()
      .then((session) => {
        if (cancelled) return;
        if (!session) return setState({ phase: "caught_up" });
        const index = session.items.findIndex((i) => !i.completed);
        setState(index === -1 ? { phase: "done", session, reviewed: session.total_items } : { phase: "card", session, index, revealed: false, submitting: false, error: null });
      })
      .catch((e) => !cancelled && setState({ phase: "error", message: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, []);

  const reveal = useCallback(() => {
    setState((s) => (s.phase === "card" && !s.revealed ? { ...s, revealed: true } : s));
  }, []);

  const rate = useCallback(
    async (rating: Rating) => {
      if (state.phase !== "card" || !state.revealed || state.submitting) return;
      const { session, index } = state;
      const item = session.items[index];
      setState({ ...state, submitting: true, error: null });
      try {
        await submitReview({ word_id: item.word.id, rating, client_request_id: (requestId.current ??= newId()), session_item_id: item.id });
        requestId.current = null;
        const next = index + 1;
        setState(
          next >= session.items.length
            ? { phase: "done", session, reviewed: session.items.length }
            : { phase: "card", session, index: next, revealed: false, submitting: false, error: null },
        );
      } catch (e) {
        setState({ ...state, submitting: false, error: `${errorMessage(e)} Your answer was not saved. Try again.` });
      }
    },
    [state],
  );

  return { state, reveal, rate };
}
