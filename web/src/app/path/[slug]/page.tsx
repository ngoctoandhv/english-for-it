import { Suspense } from "react";
import { UnitScreen } from "@/features/path/unit-screen";

export default function Page() {
  return (
    <Suspense>
      <UnitScreen />
    </Suspense>
  );
}
