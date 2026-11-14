"use client";

import type { ReactNode } from "react";
import { AuthAside } from "./auth-aside";
import { Brand } from "@/components/layout/brand";
import { Preferences } from "@/components/layout/preferences";

/** Header plus a narrow centred column, shared by the signed-out account pages. */
export function CenteredPage({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10 md:h-16">
          <Brand />
          <Preferences />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-5 py-10 lg:grid-cols-2 lg:px-10">
      <AuthAside />
      <main className="flex w-full max-w-sm flex-col justify-center gap-8 lg:justify-self-center">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {sub && <p className="text-muted-foreground">{sub}</p>}
        </div>
        {children}
      </main>
      </div>
    </div>
  );
}
