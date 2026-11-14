import type { FieldDef, ResourceConfig } from "./resources";

export type Values = Record<string, unknown>;
type Item = Values & { id?: number; _destroy?: boolean };

/** Turns an API record into editable form values. */
export function toFormValues(fields: FieldDef[], record: Values | null): Values {
  const values: Values = {};
  for (const f of fields) {
    if (f.kind === "list") values[f.name] = ((record?.[f.responseKey] as Item[] | undefined) ?? []).map((i) => itemToForm(f.fields, i));
    else if (f.kind === "id-picker") values[f.name] = (record?.[f.name] as number[] | undefined) ?? [];
    else if (f.kind === "lines") values[f.name] = ((record?.[f.name] as string[] | undefined) ?? []).join("\n");
    else values[f.name] = record?.[f.name] ?? (f.kind === "select" ? f.options[0]?.value ?? "" : "");
  }
  return values;
}

function itemToForm(fields: FieldDef[], item: Item): Item {
  const copy: Item = { ...item };
  for (const sub of fields) if (sub.kind === "lines" && Array.isArray(copy[sub.name])) copy[sub.name] = (copy[sub.name] as string[]).join("\n");
  return copy;
}

function subValue(sub: FieldDef, raw: unknown): unknown {
  if (sub.kind === "lines") return String(raw ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (sub.kind === "select") return raw || sub.options[0]?.value || "";
  if (sub.kind === "number") return raw === "" || raw == null ? undefined : Number(raw);
  return raw ?? "";
}

/** Builds the request body: nested lists become *_attributes (removed saved items get _destroy). */
export function buildPayload(config: ResourceConfig, values: Values): Values {
  const body: Values = {};
  for (const f of config.fields) {
    const v = values[f.name];
    if (f.kind === "list") {
      let live = 0;
      body[`${f.name}_attributes`] = (v as Item[]).map((item) => {
        if (item._destroy) return { id: item.id, _destroy: true };
        const attrs: Values = Object.fromEntries(f.fields.map((sub) => [sub.name, subValue(sub, item[sub.name])]));
        if (f.indexAs) attrs[f.indexAs] = live++;
        return item.id ? { id: item.id, ...attrs } : attrs;
      }).filter((a) => !(a._destroy && a.id === undefined));
    } else if (f.kind === "lines") {
      body[f.name] = subValue(f, v);
    } else if (f.kind === "number") {
      body[f.name] = v === "" || v == null ? undefined : Number(v);
    } else if (f.kind === "remote-select") {
      body[f.name] = v === "" ? null : v;
    } else {
      body[f.name] = v;
    }
  }
  return { [config.paramKey]: body };
}
