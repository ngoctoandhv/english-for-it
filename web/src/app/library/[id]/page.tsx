import { Suspense } from "react";
import { WordPage } from "@/features/library/word-page";

export default function Page() {
  return (
    <Suspense>
      <WordPage />
    </Suspense>
  );
}
