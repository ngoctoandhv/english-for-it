"use client";

import { Flag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { sendReport, type ReportType } from "@/lib/api/metrics";
import { useI18n } from "@/lib/i18n/provider";

/** A small "report a mistake" control for any piece of learning content. Reports go to the admin queue. */
export function ReportIssue({ type, id }: { type: ReportType; id: number }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = String(new FormData(e.currentTarget).get("message") ?? "").trim();
    if (!message) return;
    try {
      await sendReport(type, id, message);
      setSent(true);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  if (sent) return <p role="status" className="text-sm text-muted-foreground">{t("report.sent")}</p>;
  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-muted-foreground">
        <Flag aria-hidden /> {t("report.button")}
      </Button>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-2 rounded-md border p-3">
      <label htmlFor={`report-${type}-${id}`} className="text-sm font-medium">{t("report.title")}</label>
      <textarea id={`report-${type}-${id}`} name="message" required maxLength={500} rows={3} placeholder={t("report.placeholder")} className="w-full rounded-lg border bg-background p-2 text-sm" />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm">{t("report.send")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>{t("report.cancel")}</Button>
      </div>
    </form>
  );
}
