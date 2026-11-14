"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/layout/section-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminGet, adminList, adminRemoveAudio, adminSave, adminUploadAudio, type AdminRecord } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { adminText } from "@/lib/i18n/admin";
import { useI18n } from "@/lib/i18n/provider";
import { buildPayload, toFormValues, type Values } from "./payload";
import { findResource, type FieldDef } from "./resources";

const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
type Setter = (name: string, value: unknown) => void;

export function AdminForm() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const { t } = useI18n();
  const config = findResource(resource);
  const router = useRouter();
  const isNew = id === "new";
  const [values, setValues] = useState<Values | null>(null);
  const [record, setRecord] = useState<AdminRecord | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!config) return;
    if (isNew) {
      queueMicrotask(() => setValues(toFormValues(config.fields, null)));
      return;
    }
    adminGet(config.path, id).then((r) => (setRecord(r), setValues(toFormValues(config.fields, r)))).catch((e) => setErrors([errorMessage(e, t)]));
  }, [config, id, isNew, t]);

  if (!config) notFound();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!values) return;
    setBusy(true);
    setErrors([]);
    setSaved(false);
    try {
      const rec = await adminSave(config!.path, isNew ? null : id, buildPayload(config!, values));
      if (isNew) {
        router.replace(`/admin/${config!.key}/${rec.id}`);
      } else {
        setRecord(rec);
        setValues(toFormValues(config!.fields, rec));
        setSaved(true);
      }
    } catch (err) {
      const details = err instanceof ApiError && err.details ? Object.entries(err.details).map(([k, v]) => `${k.replaceAll("_", " ")}: ${v.join(", ")}`) : [];
      setErrors(details.length ? details : [errorMessage(err, t)]);
    } finally {
      setBusy(false);
    }
  }

  async function audio(file: File | null) {
    if (!file || !record) return;
    try {
      setRecord(await adminUploadAudio(config!.path, record.id, file));
    } catch (err) {
      setErrors([errorMessage(err, t)]);
    }
  }

  const set: Setter = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const resName = t(`admin.res.${config.key}`);
  const itemName = t(`admin.item.${config.key}`);

  return (
    <AppShell admin>
      <Link href={`/admin/${config.key}`} className="text-sm text-muted-foreground underline underline-offset-4">← {resName}</Link>
      <h1 className="mb-8 mt-3 text-3xl sm:text-4xl">{isNew ? t("admin.newItem", { name: itemName }) : t("admin.editItem", { name: itemName })}</h1>
      {values && (
        <form onSubmit={submit} className="max-w-3xl space-y-6" noValidate>
          {config.fields.map((f) => (
            <FieldInput key={f.name} field={f} values={values} set={set} />
          ))}
          {errors.length > 0 && (
            <ul role="alert" className="list-inside list-disc text-sm text-destructive">
              {errors.map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
          {saved && <p role="status" className="text-sm text-success">{t("admin.saved")}</p>}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>{busy ? t("admin.saving") : t("admin.save")}</Button>
        </form>
      )}
      {config.hasAudio && record && (
        <section className="mt-12 max-w-3xl space-y-3" aria-labelledby="audio">
          <SectionTitle id="audio">{t("admin.audio")}</SectionTitle>
          {typeof record.audio_url === "string" && (
            <div className="flex flex-wrap items-center gap-3">
              <audio controls src={record.audio_url} className="h-10 max-w-full" />
              <Button variant="outline" size="sm" className="text-destructive" onClick={async () => setRecord(await adminRemoveAudio(config.path, record.id))}>{t("admin.removeShort")}</Button>
            </div>
          )}
          <Input type="file" accept="audio/*" aria-label={t("admin.uploadAudio")} onChange={(e) => audio(e.target.files?.[0] ?? null)} />
          <p className="text-sm text-muted-foreground">{t("admin.audioHint")}</p>
        </section>
      )}
    </AppShell>
  );
}

function FieldInput({ field, values, set }: { field: FieldDef; values: Values; set: Setter }) {
  const { t } = useI18n();
  const [options, setOptions] = useState<{ id: number; label: string }[]>([]);
  const source = field.kind === "remote-select" || field.kind === "id-picker" ? field : null;

  useEffect(() => {
    if (!source) return;
    adminList(source.source, { per_page: 100 }).then((r) => setOptions(r.data.map((o) => ({ id: o.id, label: String(o[source.labelKey]) })))).catch(() => undefined);
  }, [source]);

  const id = `f-${field.name}`;
  const value = values[field.name];
  const label = adminText(t, field.label);

  if (field.kind === "list") {
    const items = value as Values[];
    const itemName = adminText(t, field.itemLabel);
    const update = (i: number, patch: Values) => set(field.name, items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
    return (
      <fieldset className="space-y-1">
        <legend className="mb-2 font-display text-base">{label}</legend>
        <div className="divide-y border-y">
          {items.map((item, i) =>
            item._destroy ? null : (
              <div key={i} className="space-y-3 py-4">
                {field.fields.map((sub) => {
                  const sid = `${id}-${i}-${sub.name}`;
                  return (
                    <div key={sub.name} className="space-y-1.5">
                      <Label htmlFor={sid}>{adminText(t, sub.label)}</Label>
                      {sub.kind === "select" ? (
                        <select id={sid} className={selectClass} value={String(item[sub.name] ?? sub.options[0]?.value ?? "")} onChange={(e) => update(i, { [sub.name]: e.target.value })}>
                          {sub.options.map((o) => <option key={o.value} value={o.value}>{adminText(t, o.label)}</option>)}
                        </select>
                      ) : sub.kind === "lines" || sub.kind === "textarea" ? (
                        <Textarea id={sid} value={String(item[sub.name] ?? "")} onChange={(e) => update(i, { [sub.name]: e.target.value })} />
                      ) : (
                        <Input id={sid} type={sub.kind === "number" ? "number" : "text"} value={String(item[sub.name] ?? "")} onChange={(e) => update(i, { [sub.name]: e.target.value })} />
                      )}
                      {"hint" in sub && sub.hint && <p className="text-sm text-muted-foreground">{adminText(t, sub.hint)}</p>}
                    </div>
                  );
                })}
                <Button type="button" variant="ghost" size="sm" className="text-destructive"
                  onClick={() => set(field.name, item.id ? items.map((it, j) => (j === i ? { ...it, _destroy: true } : it)) : items.filter((_, j) => j !== i))}>
                  {t("admin.remove", { name: itemName })}
                </Button>
              </div>
            ),
          )}
        </div>
        <Button type="button" variant="outline" className="mt-3" onClick={() => set(field.name, [...items, {}])}>{t("admin.add", { name: itemName })}</Button>
      </fieldset>
    );
  }

  if (field.kind === "id-picker") {
    const ids = value as number[];
    return (
      <fieldset className="space-y-3">
        <legend className="mb-2 font-display text-base">{label}</legend>
        {ids.length > 0 && (
          <ol className="divide-y border-y">
            {ids.map((wid, i) => (
              <li key={wid} className="flex items-center gap-1 py-1.5">
                <span className="tnum w-7 font-display text-xs text-muted-foreground">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{options.find((o) => o.id === wid)?.label ?? wid}</span>
                <Button type="button" variant="ghost" size="sm" aria-label={t("admin.up")} disabled={i === 0} onClick={() => set(field.name, move(ids, i, i - 1))}>↑</Button>
                <Button type="button" variant="ghost" size="sm" aria-label={t("admin.down")} disabled={i === ids.length - 1} onClick={() => set(field.name, move(ids, i, i + 1))}>↓</Button>
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set(field.name, ids.filter((x) => x !== wid))}>{t("admin.removeShort")}</Button>
              </li>
            ))}
          </ol>
        )}
        <select className={selectClass} aria-label={t("admin.addTo", { name: label })} value="" onChange={(e) => e.target.value && set(field.name, [...ids, Number(e.target.value)])}>
          <option value="">{t("admin.addEllipsis")}</option>
          {options.filter((o) => !ids.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </fieldset>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{"required" in field && field.required ? " *" : ""}</Label>
      {field.kind === "textarea" ? (
        <Textarea id={id} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)} />
      ) : field.kind === "select" ? (
        <select id={id} className={selectClass} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{adminText(t, o.label)}</option>)}
        </select>
      ) : field.kind === "remote-select" ? (
        <select id={id} className={selectClass} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)}>
          <option value="">{t("admin.none")}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      ) : (
        <Input id={id} type={field.kind === "number" ? "number" : "text"} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)} />
      )}
      {"hint" in field && field.hint && <p className="text-sm text-muted-foreground">{adminText(t, field.hint)}</p>}
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  copy.splice(to, 0, copy.splice(from, 1)[0]);
  return copy;
}
