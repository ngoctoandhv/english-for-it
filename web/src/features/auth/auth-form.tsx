"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import { Brand } from "@/components/layout/brand";
import { useAuth } from "./auth-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
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
      setError(errorMessage(err));
      setFields(fieldErrors(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <Brand className="self-center" />
      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Pick up where you left off. No streaks to lose." : "5–10 minutes a day is enough."}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {!isLogin && <Field name="name" label="Name" autoComplete="name" error={fields.name} />}
        <Field name="email" label="Email" type="email" autoComplete="email" error={fields.email} />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          hint={isLogin ? undefined : "At least 10 characters."}
          error={fields.password}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href={isLogin ? "/register" : "/login"}>
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </main>
  );
}

function Field({ name, label, type = "text", autoComplete, hint, error }: {
  name: string; label: string; type?: string; autoComplete?: string; hint?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} autoComplete={autoComplete} required aria-invalid={!!error} aria-describedby={`${name}-msg`} />
      <p id={`${name}-msg`} className={error ? "text-sm text-destructive" : "text-xs text-muted-foreground"}>
        {error ?? hint}
      </p>
    </div>
  );
}
