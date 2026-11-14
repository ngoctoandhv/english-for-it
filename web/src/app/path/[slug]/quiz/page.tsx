import { Suspense } from "react";
import { UnitQuizScreen } from "@/features/path/unit-quiz-screen";

export default function Page() {
  return (
    <Suspense>
      <UnitQuizScreen />
    </Suspense>
  );
}
