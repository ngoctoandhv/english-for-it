import type { FieldDef, ResourceConfig } from "./resources";

export type Values = Record<string, unknown>;
type Item = Values & { id?: number; _destroy?: boolean };

/** Turns an API record into editable form values. */
export function toFormValues(fields: FieldDef[], record: Values | null): Values {
  const values: Values = {};
  for (const f of fields) {
    if (f.kind === "list") values[f.name] = ((record?.[f.responseKey] as Item[] | undefined) ?? []).map((i) => ({ ...i }));
    else if (f.kind === "id-picker") values[f.name] = (record?.[f.name] as number[] | undefined) ?? [];
    else values[f.name] = record?.[f.name] ?? (f.kind === "select" ? f.options[0]?.value ?? "" : "");
  }
  return values;
}

/** Builds the request body: nested lists become *_attributes (removed saved items get _destroy). */
export function buildPayload(config: ResourceConfig, values: Values): Values {
  const body: Values = {};
  for (const f of config.fields) {
    const v = values[f.name];
    if (f.kind === "list") {
      body[`${f.name}_attributes`] = (v as Item[]).map((item) => {
        if (item._destroy) return { id: item.id, _destroy: true };
        const attrs: Values = Object.fromEntries(f.fields.map((sub) => [sub.name, item[sub.name] ?? ""]));
        return item.id ? { id: item.id, ...attrs } : attrs;
      }).filter((a) => !(a._destroy && a.id === undefined));
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
