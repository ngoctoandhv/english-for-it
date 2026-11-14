"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playWord } from "./speak";

export function PlayButton({ term, audioUrl }: { term: string; audioUrl: string | null }) {
  return (
    <Button variant="ghost" size="icon" aria-label={`Play pronunciation of ${term}`} onClick={() => playWord(term, audioUrl)}>
      <Volume2 />
    </Button>
  );
}
