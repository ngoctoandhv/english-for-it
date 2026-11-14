"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addFavorite, removeFavorite } from "@/lib/api/vocabulary";

export function FavoriteButton({ wordId, initial }: { wordId: number; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !on;
    setOn(next);
    try {
      await (next ? addFavorite(wordId) : removeFavorite(wordId));
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-pressed={on} aria-label={on ? "Remove from favorites" : "Add to favorites"} disabled={busy} onClick={toggle}>
      <Star className={on ? "fill-current" : ""} />
    </Button>
  );
}
