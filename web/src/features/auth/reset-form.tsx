"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api/auth";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { Field } from "./auth-form";
import { CenteredPage } from "./centered-page";

function Inner() {
  const { t } = useI18n();
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await resetPassword(token ?? "", String(new FormData(e.currentTarget).get("password")));
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, t));
      setFields(fieldErrors(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <CenteredPage title={t("acct.resetTitle")}>
      {!token ? (
        <p role="alert" className="text-destructive">{t("acct.missingToken")}</p>
      ) : done ? (
        <p role="status">{t("acct.resetDone")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field name="password" label={t("settings.new")} type="password" autoComplete="new-password" hint={t("auth.passwordHint")} error={fields.password} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{t("acct.resetBtn")}</Button>
        </form>
      )}
      <Link href="/login" className="text-sm text-primary underline underline-offset-4">{t("acct.backToSignIn")}</Link>
    </CenteredPage>
  );
}

export function ResetForm() {
  return <Suspense><Inner /></Suspense>;
}
