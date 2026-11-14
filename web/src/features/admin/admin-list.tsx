"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminDelete, adminList, type AdminRecord } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/errors";
import type { Meta } from "@/lib/api/types";
import { adminText } from "@/lib/i18n/admin";
import { useI18n } from "@/lib/i18n/provider";
import { findResource } from "./resources";

export function AdminList() {
  const { resource } = useParams<{ resource: string }>();
  const { t } = useI18n();
  const config = findResource(resource);
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    if (!config) return;
    adminList(config.path, { page, per_page: 25 })
      .then((r) => (setRows(r.data), setMeta(r.meta), setError(null), setLoaded(true)))
      .catch((e) => setError(errorMessage(e, t)));
  }, [config, page, t]);

  useEffect(load, [load]);
  if (!config) notFound();

  async function remove(id: number) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try {
      await adminDelete(config!.path, id);
      load();
    } catch (e) {
      setError(errorMessage(e, t));
    }
  }

  const [first, ...rest] = config.columns;
  const statusCol = rest.find((c) => c.label === "Status");
  const metaCols = rest.filter((c) => c !== statusCol);
  const name = t(`admin.res.${config.key}`);

  return (
    <AppShell admin>
      <Link href="/admin" className="text-sm text-muted-foreground underline underline-offset-4">← {t("nav.admin")}</Link>
      <div className="mb-8 mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl">{name}</h1>
        {!config.noCreate && (
          <Link href={`/admin/${config.key}/new`} className={buttonVariants({ className: "w-full sm:w-auto" })}>
            {t("admin.new")}
          </Link>
        )}
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      {loaded && rows.length === 0 && <p className="text-muted-foreground">{t("admin.empty")}</p>}

      <ul className="divide-y border-y">
        {rows.map((r) => {
          const status = statusCol ? String(statusCol.value(r)) : null;
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <Link href={`/admin/${config.key}/${r.id}`} className="min-w-0 flex-1 basis-40 py-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-display text-base">{first.value(r)}</span>
                  {status && <StatusBadge status={status} label={t(`status.${status}`)} />}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {metaCols.map((c) => `${adminText(t, c.label)}: ${adminText(t, c.value(r))}`).join(" · ")}
                </span>
              </Link>
              <div className="flex gap-1">
                <Link href={`/admin/${config.key}/${r.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>{t("admin.edit")}</Link>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(r.id)}>{t("admin.delete")}</Button>
              </div>
            </li>
          );
        })}
      </ul>

      {meta && meta.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t("common.prev")}</Button>
          <span className="tnum font-display text-xs">{t("common.pageOf", { page: meta.page, total: meta.total_pages })}</span>
          <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>{t("common.next")}</Button>
        </div>
      )}
    </AppShell>
  );
}
