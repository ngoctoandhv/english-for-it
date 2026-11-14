import { Suspense } from "react";
import { AdminForm } from "@/features/admin/admin-form";

export default function Page() {
  return (
    <Suspense>
      <AdminForm />
    </Suspense>
  );
}
