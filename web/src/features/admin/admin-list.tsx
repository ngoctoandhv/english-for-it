"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { adminDelete, adminList, type AdminRecord } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/errors";
import type { Meta } from "@/lib/api/types";
import { findResource } from "./resources";

export function AdminList() {
  const { resource } = useParams<{ resource: string }>();
  const config = findResource(resource);
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!config) return;
    adminList(config.path, { page, per_page: 25 })
      .then((r) => (setRows(r.data), setMeta(r.meta), setError(null)))
      .catch((e) => setError(errorMessage(e)));
  }, [config, page]);

  useEffect(load, [load]);
  if (!config) notFound();

  async function remove(id: number) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await adminDelete(config!.path, id);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <AppShell admin>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl leading-tight">{config.label}</h1>
        <Link href={`/admin/${config.key}/new`} className={buttonVariants()}>
          New
        </Link>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              {config.columns.map((c) => (
                <th key={c.label} className="px-3 py-2 font-medium">{c.label}</th>
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                {config.columns.map((c) => (
                  <td key={c.label} className="px-3 py-2">{c.value(r)}</td>
                ))}
                <td className="flex justify-end gap-1 px-3 py-1.5">
                  <Link href={`/admin/${config.key}/${r.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>Edit</Link>
                  <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && meta.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {meta.page} of {meta.total_pages}</span>
          <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </AppShell>
  );
}
