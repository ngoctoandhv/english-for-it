"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { Field } from "./auth-form";
import { CenteredPage } from "./centered-page";

export function ForgotForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(String(new FormData(e.currentTarget).get("email")));
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <CenteredPage title={t("acct.forgotTitle")} sub={t("acct.forgotSub")}>
      {sent ? (
        <p role="status">{t("acct.sent")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field name="email" label={t("auth.email")} type="email" autoComplete="email" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{t("acct.sendLink")}</Button>
        </form>
      )}
      <Link href="/login" className="text-sm text-primary underline underline-offset-4">{t("acct.backToSignIn")}</Link>
    </CenteredPage>
  );
}
