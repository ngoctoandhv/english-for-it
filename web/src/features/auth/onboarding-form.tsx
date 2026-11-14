"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Preferences } from "@/components/layout/preferences";
import { useI18n } from "@/lib/i18n/provider";
import { completeOnboarding } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import type { FocusGoal, FocusRole } from "@/lib/api/types";
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
  const ROLES: { value: FocusRole; title: string; text: string }[] = (["developer", "qa", "devops", "analyst", "manager", "other"] as const).map((r) => ({ value: r, title: t(`role.${r}`), text: "" }));
  const FOCUS: { value: FocusGoal; title: string; text: string }[] = (["daily_work", "interview", "docs"] as const).map((g) => ({ value: g, title: t(`focus.${g}`), text: "" }));
  const { setUser, user } = useAuth();
  const router = useRouter();
  const [level, setLevel] = useState<string>(user?.level ?? "elementary");
  const [role, setRole] = useState<FocusRole>(user?.focus_role ?? "developer");
  const [focus, setFocus] = useState<FocusGoal>(user?.focus_goal ?? "daily_work");
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
        focus_role: role,
        focus_goal: focus,
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
      <Choice legend={t("onboarding.role")} options={ROLES} value={role} onChange={(v) => setRole(v)} />
      <Choice legend={t("onboarding.focus")} options={FOCUS} value={focus} onChange={(v) => setFocus(v)} />
      <Choice legend={t("onboarding.level")} options={LEVELS} value={level} onChange={(v) => setLevel(String(v))} />
      <Link href="/placement" className="-mt-4 text-sm text-primary underline underline-offset-4">{t("onboarding.unsure")}</Link>
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
              {o.text && <span className="text-muted-foreground">{o.text}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
