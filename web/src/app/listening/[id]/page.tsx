import { Suspense } from "react";
import { LessonPlayer } from "@/features/listening/lesson-player";

export default function Page() {
  return (
    <Suspense>
      <LessonPlayer />
    </Suspense>
  );
}
