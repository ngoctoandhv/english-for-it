"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { updateMe } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/errors";
import { getPushKey, sendTestPush, subscribePush, unsubscribePush } from "@/lib/api/push";
import { useI18n } from "@/lib/i18n/provider";
import { pushSupported, toSubscriptionJson, urlBase64ToUint8Array } from "@/lib/pwa/push";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";

/** Daily reminder through Web Push, plus the Install app button. Hidden when the server has no push keys. */
export function Reminders() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const [key, setKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    getPushKey().then(setKey, () => setKey(null));
  }, []);

  if (!user) return null;
  const on = user.push_devices > 0 && user.reminder_hour !== null;

  async function enable() {
    if (!key) return;
    setBusy(true);
    setMessage(null);
    try {
      if (!pushSupported()) return setMessage(t("remind.unsupported"));
      if ((await Notification.requestPermission()) !== "granted") return setMessage(t("remind.denied"));
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      setUser(await subscribePush(toSubscriptionJson(sub)));
    } catch (e) {
      setMessage(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setUser(await unsubscribePush(sub.endpoint));
        await sub.unsubscribe();
      }
    } catch (e) {
      setMessage(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  async function setHour(hour: number) {
    try {
      setUser((await updateMe({ reminder_hour: hour })).user);
    } catch (e) {
      setMessage(errorMessage(e, t));
    }
  }

  return (
    <section aria-labelledby="remind" className="space-y-4">
      <SectionTitle id="remind">{t("remind.title")}</SectionTitle>
      {key ? (
        <>
          <p className="text-muted-foreground">{t("remind.text")}</p>
          {on ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="hour" className="text-sm font-medium">{t("remind.hour")}</label>
                <select id="hour" value={user.reminder_hour ?? 18} onChange={(e) => setHour(Number(e.target.value))} className="h-11 w-full rounded-lg border bg-background px-3">
                  {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => sendTestPush().then((n) => setMessage(n > 0 ? t("remind.testSent") : t("remind.testFailed")), (e) => setMessage(errorMessage(e, t)))}>{t("remind.test")}</Button>
                <Button variant="ghost" onClick={disable} disabled={busy}>{t("remind.off")}</Button>
              </div>
            </div>
          ) : (
            <Button onClick={enable} disabled={busy}>{t("remind.on")}</Button>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">{t("remind.unavailable")}</p>
      )}
      {canInstall && <Button variant="outline" onClick={install}>{t("remind.install")}</Button>}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
