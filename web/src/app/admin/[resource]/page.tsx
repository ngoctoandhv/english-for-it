import { Suspense } from "react";
import { AdminList } from "@/features/admin/admin-list";

export default function Page() {
  return (
    <Suspense>
      <AdminList />
    </Suspense>
  );
}
