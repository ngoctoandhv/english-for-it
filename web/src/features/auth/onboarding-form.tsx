"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { useRequireAuth } from "./use-require-auth";

const LEVELS = [
  { value: "beginner", title: "Beginner", text: "I know a few words and short sentences." },
  { value: "elementary", title: "Elementary", text: "I can read simple docs but struggle to speak." },
  { value: "intermediate", title: "Intermediate", text: "I follow most of it, I want to sound natural at work." },
];
const GOALS = [
  { value: 5, title: "5 minutes", text: "Light" },
  { value: 10, title: "10 minutes", text: "Steady" },
  { value: 15, title: "15 minutes", text: "Focused" },
];

export function OnboardingForm() {
  const { ready } = useRequireAuth({ allowUnonboarded: true });
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
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s set you up</h1>
        <p className="text-sm text-muted-foreground">Two questions. You can change them later.</p>
      </div>
      <Choice legend="Your English level" options={LEVELS} value={level} onChange={(v) => setLevel(String(v))} />
      <Choice legend="Daily time" options={GOALS} value={goal} onChange={(v) => setGoal(Number(v))} />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button size="lg" onClick={submit} disabled={busy} className="w-full sm:w-auto">
        {busy ? "Saving…" : "Start learning"}
      </Button>
    </main>
  );
}

function Choice<T extends string | number>({ legend, options, value, onChange }: {
  legend: string; options: { value: T; title: string; text: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={String(o.value)}
            className={cn(
              "cursor-pointer rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              value === o.value ? "border-primary bg-muted" : "hover:bg-muted/50",
            )}
          >
            <input type="radio" className="sr-only" name={legend} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="block font-medium">{o.title}</span>
            <span className="block text-muted-foreground">{o.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
