"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Preferences } from "@/components/layout/preferences";
import { useI18n } from "@/lib/i18n/provider";
import { completeOnboarding } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { useAuth } from "./auth-provider";
import { useRequireAuth } from "./use-require-auth";

export function OnboardingForm() {
  const { ready } = useRequireAuth({ allowUnonboarded: true });
  const { t } = useI18n();
  const LEVELS = [
    { value: "beginner", title: t("level.beginner"), text: t("onboarding.levelBeginner") },
    { value: "elementary", title: t("level.elementary"), text: t("onboarding.levelElementary") },
    { value: "intermediate", title: t("level.intermediate"), text: t("onboarding.levelIntermediate") },
  ];
  const GOALS = [
    { value: 5, title: t("onboarding.minutes", { count: 5 }), text: t("onboarding.light") },
    { value: 10, title: t("onboarding.minutes", { count: 10 }), text: t("onboarding.steady") },
    { value: 15, title: t("onboarding.minutes", { count: 15 }), text: t("onboarding.focused") },
  ];
  const { setUser } = useAuth();
  const router = useRouter();
  const [level, setLevel] = useState("elementary");
  const [goal, setGoal] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return null;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const { user } = await completeOnboarding({
        level,
        daily_goal_minutes: goal,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setUser(user);
      router.replace("/");
    } catch (e) {
      setError(errorMessage(e, t));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-5 py-10">
      <div className="flex justify-end"><Preferences /></div>
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl">{t("onboarding.title")}</h1>
        <p className="text-muted-foreground">{t("onboarding.sub")}</p>
      </div>
      <Choice legend={t("onboarding.level")} options={LEVELS} value={level} onChange={(v) => setLevel(String(v))} />
      <Choice legend={t("onboarding.time")} options={GOALS} value={goal} onChange={(v) => setGoal(Number(v))} />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button size="lg" onClick={submit} disabled={busy} className="w-full sm:w-auto">
        {busy ? t("onboarding.saving") : t("onboarding.save")}
      </Button>
    </main>
  );
}

function Choice<T extends string | number>({ legend, options, value, onChange }: {
  legend: string; options: { value: T; title: string; text: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-xl">{legend}</legend>
      <div className="divide-y border-y">
        {options.map((o) => (
          <label key={String(o.value)} className="flex cursor-pointer items-center gap-4 py-4 hover:bg-muted/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
            <input type="radio" className="size-5 accent-primary" name={legend} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="grid flex-1 gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <span className="font-display">{o.title}</span>
              <span className="text-muted-foreground">{o.text}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
