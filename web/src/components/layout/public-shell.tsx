"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { Brand } from "./brand";
import { Preferences } from "./preferences";

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <span>{t("app.name")}</span>
        <Link href="/glossary" className="hover:text-foreground">{t("public.glossary")}</Link>
        <Link href="/privacy" className="hover:text-foreground">{t("legal.privacy")}</Link>
        <Link href="/terms" className="hover:text-foreground">{t("legal.terms")}</Link>
      </div>
    </footer>
  );
}

/** Header and footer for pages anyone can read, signed in or not. */
export function PublicShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
          <Brand />
          <div className="flex items-center gap-3">
            <Preferences />
            <Link href="/login" className="hidden text-[15px] text-muted-foreground hover:text-foreground sm:inline">{t("nav.signIn")}</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 md:py-14">{children}</main>
      <PublicFooter />
    </div>
  );
}
