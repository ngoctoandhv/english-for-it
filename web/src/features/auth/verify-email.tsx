"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n/provider";
import { CenteredPage } from "./centered-page";

function Inner() {
  const { t } = useI18n();
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"working" | "ok" | "failed">(token ? "working" : "failed");

  useEffect(() => {
    if (!token) return;
    verifyEmail(token).then(() => setState("ok"), () => setState("failed"));
  }, [token]);

  return (
    <CenteredPage title={t("settings.email")}>
      <p role="status" className={state === "failed" ? "text-destructive" : undefined}>
        {state === "working" ? t("acct.verifying") : state === "ok" ? t("acct.verified") : t("acct.verifyFailed")}
      </p>
      <Link href="/" className="text-sm text-primary underline underline-offset-4">{t("nav.today")}</Link>
    </CenteredPage>
  );
}

export function VerifyEmail() {
  return <Suspense><Inner /></Suspense>;
}
