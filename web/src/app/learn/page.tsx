import { Suspense } from "react";
import { FlashcardScreen } from "@/features/learn/flashcard-screen";

export default function Page() {
  return (
    <Suspense>
      <FlashcardScreen />
    </Suspense>
  );
}
