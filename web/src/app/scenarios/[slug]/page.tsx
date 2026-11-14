import { Suspense } from "react";
import { ScenarioPlayer } from "@/features/scenarios/scenario-player";

export default function Page() {
  return (
    <Suspense>
      <ScenarioPlayer />
    </Suspense>
  );
}
