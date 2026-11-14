"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RESOURCES } from "./resources";

export function AdminHome() {
  return (
    <AppShell admin>
      <h1 className="mb-6 text-4xl leading-tight">Content admin</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {RESOURCES.map((r) => (
          <li key={r.key}>
            <Link href={`/admin/${r.key}`} className="block rounded-lg border p-4 font-medium hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
