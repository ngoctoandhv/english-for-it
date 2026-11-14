"use client";

import { useI18n } from "@/lib/i18n/provider";

/** Left panel of the sign-in and account pages on wide screens: what the product is, in a few lines. */
export function AuthAside() {
  const { t } = useI18n();
  return (
    <aside className="hidden space-y-6 lg:block" aria-hidden>
      <p className="font-display text-sm text-primary">&gt;_ English for IT</p>
      <p className="text-4xl leading-tight xl:text-5xl">{t("landing.title")}</p>
      <p className="max-w-md text-lg text-muted-foreground">{t("landing.lead")}</p>
      <ul className="max-w-md divide-y border-y">
        {[1, 2, 3, 4].map((n) => (
          <li key={n} className="py-3 font-display text-sm">{t(`landing.p${n}.title`)}</li>
        ))}
      </ul>
    </aside>
  );
}
