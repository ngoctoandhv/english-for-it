"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { playWord } from "./speak";

export function PlayButton({ term, audioUrl }: { term: string; audioUrl: string | null }) {
  const { t } = useI18n();
  return (
    <Button variant="ghost" size="icon" aria-label={t("lib.play", { term })} onClick={() => playWord(term, audioUrl)}>
      <Volume2 />
    </Button>
  );
}
