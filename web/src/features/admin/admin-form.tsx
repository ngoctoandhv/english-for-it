"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminGet, adminList, adminRemoveAudio, adminSave, adminUploadAudio, type AdminRecord } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { buildPayload, toFormValues, type Values } from "./payload";
import { findResource, type FieldDef } from "./resources";

const selectClass = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";
type Setter = (name: string, value: unknown) => void;

export function AdminForm() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
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
    adminGet(config.path, id).then((r) => (setRecord(r), setValues(toFormValues(config.fields, r)))).catch((e) => setErrors([errorMessage(e)]));
  }, [config, id, isNew]);

  if (!config) notFound();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!values) return;
    setBusy(true);
    setErrors([]);
    setSaved(false);
    try {
      const rec = await adminSave(config!.path, isNew ? null : id, buildPayload(config!, values));
      if (isNew) router.replace(`/admin/${config!.key}/${rec.id}`);
      else (setRecord(rec), setValues(toFormValues(config!.fields, rec)), setSaved(true));
    } catch (err) {
      const details = err instanceof ApiError && err.details ? Object.entries(err.details).map(([k, v]) => `${k.replaceAll("_", " ")}: ${v.join(", ")}`) : [];
      setErrors(details.length ? details : [errorMessage(err)]);
    } finally {
      setBusy(false);
    }
  }

  async function audio(file: File | null) {
    if (!file || !record) return;
    try {
      setRecord(await adminUploadAudio(config!.path, record.id, file));
    } catch (err) {
      setErrors([errorMessage(err)]);
    }
  }

  const set: Setter = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  return (
    <AppShell admin>
      <Link href={`/admin/${config.key}`} className="text-sm text-muted-foreground underline underline-offset-4">← {config.label}</Link>
      <h1 className="mb-6 mt-2 text-4xl leading-tight">{isNew ? "New" : "Edit"} {config.label.toLowerCase()}</h1>
      {values && (
        <form onSubmit={submit} className="max-w-2xl space-y-5" noValidate>
          {config.fields.map((f) => (
            <FieldInput key={f.name} field={f} values={values} set={set} />
          ))}
          {errors.length > 0 && (
            <ul role="alert" className="list-inside list-disc text-sm text-destructive">
              {errors.map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
          {saved && <p role="status" className="text-sm text-muted-foreground">Saved.</p>}
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </form>
      )}
      {config.hasAudio && record && (
        <section className="mt-10 max-w-2xl space-y-2 border-t pt-6">
          <h2 className="text-sm font-medium">Audio</h2>
          {typeof record.audio_url === "string" && (
            <div className="flex items-center gap-3">
              <audio controls src={record.audio_url} className="h-9" />
              <Button variant="destructive" size="sm" onClick={async () => setRecord(await adminRemoveAudio(config.path, record.id))}>Remove</Button>
            </div>
          )}
          <Input type="file" accept="audio/*" aria-label="Upload audio" onChange={(e) => audio(e.target.files?.[0] ?? null)} />
        </section>
      )}
    </AppShell>
  );
}

function FieldInput({ field, values, set }: { field: FieldDef; values: Values; set: Setter }) {
  const [options, setOptions] = useState<{ id: number; label: string }[]>([]);
  const source = field.kind === "remote-select" || field.kind === "id-picker" ? field : null;

  useEffect(() => {
    if (!source) return;
    adminList(source.source, { per_page: 100 }).then((r) => setOptions(r.data.map((o) => ({ id: o.id, label: String(o[source.labelKey]) })))).catch(() => undefined);
  }, [source]);

  const id = `f-${field.name}`;
  const value = values[field.name];

  if (field.kind === "list") {
    const items = value as Values[];
    return (
      <fieldset className="space-y-3 rounded-lg border p-3">
        <legend className="px-1 text-sm font-medium">{field.label}</legend>
        {items.map((item, i) =>
          item._destroy ? null : (
            <div key={i} className="space-y-2 rounded-md bg-muted/40 p-3">
              {field.fields.map((sub) => (
                <div key={sub.name} className="space-y-1">
                  <Label htmlFor={`${id}-${i}-${sub.name}`}>{sub.label}</Label>
                  {sub.kind === "select" ? (
                    <select id={`${id}-${i}-${sub.name}`} className={selectClass} value={String(item[sub.name] ?? sub.options[0]?.value ?? "")}
                      onChange={(e) => set(field.name, items.map((it, j) => (j === i ? { ...it, [sub.name]: e.target.value } : it)))}>
                      {sub.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : sub.kind === "lines" || sub.kind === "textarea" ? (
                    <Textarea id={`${id}-${i}-${sub.name}`} value={String(item[sub.name] ?? "")}
                      onChange={(e) => set(field.name, items.map((it, j) => (j === i ? { ...it, [sub.name]: e.target.value } : it)))} />
                  ) : (
                  <Input id={`${id}-${i}-${sub.name}`} type={sub.kind === "number" ? "number" : "text"} value={String(item[sub.name] ?? "")}
                    onChange={(e) => set(field.name, items.map((it, j) => (j === i ? { ...it, [sub.name]: e.target.value } : it)))} />
                  )}
                  {"hint" in sub && sub.hint && <p className="text-xs text-muted-foreground">{sub.hint}</p>}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm"
                onClick={() => set(field.name, item.id ? items.map((it, j) => (j === i ? { ...it, _destroy: true } : it)) : items.filter((_, j) => j !== i))}>
                Remove {field.itemLabel}
              </Button>
            </div>
          ),
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => set(field.name, [...items, {}])}>Add {field.itemLabel}</Button>
      </fieldset>
    );
  }

  if (field.kind === "id-picker") {
    const ids = value as number[];
    return (
      <fieldset className="space-y-2 rounded-lg border p-3">
        <legend className="px-1 text-sm font-medium">{field.label}</legend>
        <ol className="space-y-1 text-sm">
          {ids.map((wid, i) => (
            <li key={wid} className="flex items-center gap-2">
              <span className="flex-1">{options.find((o) => o.id === wid)?.label ?? wid}</span>
              <Button type="button" variant="ghost" size="xs" disabled={i === 0} onClick={() => set(field.name, move(ids, i, i - 1))}>Up</Button>
              <Button type="button" variant="ghost" size="xs" disabled={i === ids.length - 1} onClick={() => set(field.name, move(ids, i, i + 1))}>Down</Button>
              <Button type="button" variant="ghost" size="xs" onClick={() => set(field.name, ids.filter((x) => x !== wid))}>Remove</Button>
            </li>
          ))}
        </ol>
        <select className={selectClass} aria-label={`Add to ${field.label}`} value="" onChange={(e) => e.target.value && set(field.name, [...ids, Number(e.target.value)])}>
          <option value="">Add…</option>
          {options.filter((o) => !ids.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </fieldset>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{field.label}{"required" in field && field.required ? " *" : ""}</Label>
      {field.kind === "textarea" ? (
        <Textarea id={id} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)} />
      ) : field.kind === "select" ? (
        <select id={id} className={selectClass} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.kind === "remote-select" ? (
        <select id={id} className={selectClass} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)}>
          <option value="">None</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      ) : (
        <Input id={id} type={field.kind === "number" ? "number" : "text"} value={String(value ?? "")} onChange={(e) => set(field.name, e.target.value)} />
      )}
      {"hint" in field && field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  copy.splice(to, 0, copy.splice(from, 1)[0]);
  return copy;
}
