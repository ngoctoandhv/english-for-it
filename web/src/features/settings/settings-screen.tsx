"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reminders } from "./reminders";
import { useAuth } from "@/features/auth/auth-provider";
import { useRequireAuth } from "@/features/auth/use-require-auth";
import { changePassword, deleteAccount, exportMyData, resendVerification, updateMe } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";

const LEVELS = ["beginner", "elementary", "intermediate"] as const;
const GOALS = [5, 10, 15] as const;
const ROLES = ["developer", "qa", "devops", "analyst", "manager", "other"] as const;
const FOCUS = ["daily_work", "interview", "docs"] as const;

function Message({ text, error }: { text: string | null; error?: boolean }) {
  if (!text) return null;
  return <p role={error ? "alert" : "status"} className={error ? "text-sm text-destructive" : "text-sm text-primary"}>{text}</p>;
}

export function SettingsScreen() {
  const { ready, user } = useRequireAuth();
  const { setUser, logout } = useAuth();
  const { t } = useI18n();
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [mailMsg, setMailMsg] = useState<string | null>(null);
  const [delMsg, setDelMsg] = useState<string | null>(null);

  if (!ready || !user) return null;

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    try {
      const res = await updateMe({ name: String(d.get("name")), level: String(d.get("level")), daily_goal_minutes: Number(d.get("goal")), focus_role: String(d.get("role")) as (typeof ROLES)[number], focus_goal: String(d.get("focus")) as (typeof FOCUS)[number], new_words_per_day: d.get("newWords") ? Number(d.get("newWords")) : null });
      setUser(res.user);
      setProfileMsg({ text: t("settings.saved") });
    } catch (err) {
      setProfileMsg({ text: errorMessage(err, t), error: true });
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    try {
      await changePassword(String(d.get("current")), String(d.get("next")));
      form.reset();
      setPwMsg({ text: t("settings.passwordChanged") });
    } catch (err) {
      setPwMsg({ text: errorMessage(err, t), error: true });
    }
  }

  async function download() {
    const data = await exportMyData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "english-for-it-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await deleteAccount(String(new FormData(e.currentTarget).get("password")));
      await logout();
    } catch (err) {
      setDelMsg(errorMessage(err, t));
    }
  }

  return (
    <AppShell>
      <div className="space-y-10">
        <h1 className="text-3xl sm:text-4xl">{t("settings.title")}</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2 lg:items-start">
        <div className="max-w-xl space-y-14">

        <section aria-labelledby="profile" className="space-y-5">
          <SectionTitle id="profile">{t("settings.profile")}</SectionTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("settings.email")}</p>
            <p>{user.email} <span className="text-sm text-muted-foreground">· {user.email_verified ? t("settings.emailVerified") : t("settings.emailUnverified")}</span></p>
            {!user.email_verified && (
              <div className="space-y-1 pt-1">
                <p className="text-sm text-muted-foreground">{t("acct.verifyBanner")}</p>
                <Button variant="outline" size="sm" onClick={() => resendVerification().then(() => setMailMsg(t("acct.resent")), (err) => setMailMsg(errorMessage(err, t)))}>{t("acct.resend")}</Button>
                <Message text={mailMsg} />
              </div>
            )}
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("settings.name")}</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">{t("settings.role")}</Label>
              <select id="role" name="role" defaultValue={user.focus_role ?? "developer"} className="h-11 w-full rounded-lg border bg-background px-3">
                {ROLES.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focus">{t("settings.focus")}</Label>
              <select id="focus" name="focus" defaultValue={user.focus_goal ?? "daily_work"} className="h-11 w-full rounded-lg border bg-background px-3">
                {FOCUS.map((g) => <option key={g} value={g}>{t(`focus.${g}`)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">{t("settings.level")}</Label>
              <select id="level" name="level" defaultValue={user.level ?? "elementary"} className="h-11 w-full rounded-lg border bg-background px-3">
                {LEVELS.map((l) => <option key={l} value={l}>{t(`level.${l}`)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">{t("settings.goal")}</Label>
              <select id="goal" name="goal" defaultValue={user.daily_goal_minutes} className="h-11 w-full rounded-lg border bg-background px-3">
                {GOALS.map((g) => <option key={g} value={g}>{t("onboarding.minutes", { count: g })}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newWords">{t("settings.newWords")}</Label>
              <select id="newWords" name="newWords" defaultValue={user.new_words_per_day ?? ""} className="h-11 w-full rounded-lg border bg-background px-3">
                <option value="">{t("settings.newWordsAuto")}</option>
                {[5, 10, 15, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <p className="text-sm text-muted-foreground">{t("settings.newWordsHint")}</p>
            </div>
            <Link href="/placement" className="block text-sm text-primary underline underline-offset-4">{t("settings.retake")}</Link>
            <Button type="submit">{t("settings.save")}</Button>
            <Message text={profileMsg?.text ?? null} error={profileMsg?.error} />
          </form>
        </section>

        <Reminders />
        </div>

        <div className="max-w-xl space-y-14">
        <section aria-labelledby="password" className="space-y-5">
          <SectionTitle id="password">{t("settings.password")}</SectionTitle>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">{t("settings.current")}</Label>
              <Input id="current" name="current" type="password" autoComplete="current-password" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t("settings.new")}</Label>
              <Input id="new-password" name="next" type="password" autoComplete="new-password" required />
              <p className="text-sm text-muted-foreground">{t("auth.passwordHint")}</p>
            </div>
            <Button type="submit" variant="outline">{t("settings.changePassword")}</Button>
            <Message text={pwMsg?.text ?? null} error={pwMsg?.error} />
          </form>
        </section>

        <section aria-labelledby="data" className="space-y-4">
          <SectionTitle id="data">{t("settings.data")}</SectionTitle>
          <p className="text-muted-foreground">{t("settings.exportText")}</p>
          <Button variant="outline" onClick={download}>{t("settings.export")}</Button>
        </section>

        <section aria-labelledby="danger" className="space-y-4">
          <SectionTitle id="danger">{t("settings.danger")}</SectionTitle>
          <p className="text-muted-foreground">{t("settings.deleteText")}</p>
          <form onSubmit={remove} className="space-y-3">
            <Label htmlFor="del">{t("settings.deleteConfirm")}</Label>
            <Input id="del" name="password" type="password" autoComplete="current-password" required />
            <Button type="submit" variant="destructive">{t("settings.deleteBtn")}</Button>
            <Message text={delMsg} error />
          </form>
        </section>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
