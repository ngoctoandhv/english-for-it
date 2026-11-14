"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthAside } from "./auth-aside";
import { Brand } from "@/components/layout/brand";
import { Preferences } from "@/components/layout/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { useAuth } from "./auth-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setBusy(true);
    setError(null);
    setFields({});
    try {
      const user = isLogin ? await login(email, password) : await register({ email, password, name: String(data.get("name")) });
      router.replace(user.onboarded ? "/" : "/onboarding");
    } catch (err) {
      const fields = fieldErrors(err);
      // Errors on fields the form does not show (for example the time zone) are spelled out instead of a vague "check the fields".
      const hidden = Object.entries(fields).filter(([k]) => !["name", "email", "password"].includes(k));
      setError(hidden.length ? hidden.map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`).join("; ") : errorMessage(err, t));
      setFields(fields);
    } finally {
      setBusy(false);
    }
  }

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
          <h1 className="text-3xl sm:text-4xl">{isLogin ? t("auth.signIn") : t("auth.createAccount")}</h1>
          <p className="text-muted-foreground">{isLogin ? t("auth.signInSub") : t("auth.registerSub")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {!isLogin && <Field name="name" label={t("auth.name")} autoComplete="name" error={fields.name} />}
          <Field name="email" label={t("auth.email")} type="email" autoComplete="email" error={fields.email} />
          <Field
            name="password"
            label={t("auth.password")}
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            hint={isLogin ? undefined : t("auth.passwordHint")}
            error={fields.password}
          />
          {isLogin && (
            <Link href="/forgot-password" className="block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("acct.forgotLink")}</Link>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? t("auth.pleaseWait") : isLogin ? t("auth.signIn") : t("auth.createAccount")}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          {isLogin ? t("auth.newHere") : t("auth.haveAccount")}{" "}
          <Link className="text-primary underline underline-offset-4" href={isLogin ? "/register" : "/login"}>
            {isLogin ? t("auth.createAccount") : t("auth.signIn")}
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          {t("legal.agree")}{" "}
          <Link className="underline underline-offset-4" href="/terms">{t("legal.terms")}</Link>{" · "}
          <Link className="underline underline-offset-4" href="/privacy">{t("legal.privacy")}</Link>
        </p>
      </main>
      </div>
    </div>
  );
}

export function Field({ name, label, type = "text", autoComplete, hint, error }: {
  name: string; label: string; type?: string; autoComplete?: string; hint?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <Input id={name} name={name} type={type} autoComplete={autoComplete} required aria-invalid={!!error} aria-describedby={`${name}-msg`} />
      <p id={`${name}-msg`} className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
        {error ?? hint}
      </p>
    </div>
  );
}
