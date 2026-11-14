import { describe, expect, it } from "vitest";
import { buildPayload, toFormValues } from "./payload";
import { findResource } from "./resources";

const words = findResource("words")!;

describe("admin payload", () => {
  it("loads examples from the API response key into the list field", () => {
    const values = toFormValues(words.fields, { term: "bug", examples: [{ id: 1, sentence_en: "a", translation_vi: "b" }] });
    expect(values.vocabulary_examples).toEqual([{ id: 1, sentence_en: "a", translation_vi: "b" }]);
    expect(values.status).toBe("draft");
  });

  it("sends new items without id, edited items with id and removed saved items as _destroy", () => {
    const values = toFormValues(words.fields, null);
    values.term = "bug";
    values.vocabulary_examples = [
      { sentence_en: "new", translation_vi: "mới" },
      { id: 5, sentence_en: "keep", translation_vi: "giữ" },
      { id: 6, _destroy: true },
      { _destroy: true },
    ];
    const body = (buildPayload(words, values).word as Record<string, unknown>).vocabulary_examples_attributes;
    expect(body).toEqual([
      { sentence_en: "new", translation_vi: "mới" },
      { id: 5, sentence_en: "keep", translation_vi: "giữ" },
      { id: 6, _destroy: true },
    ]);
  });

  it("sends an empty category as null and numbers as numbers", () => {
    const cats = findResource("categories")!;
    const body = buildPayload(cats, { name: "X", slug: "", position: "3" }).category as Record<string, unknown>;
    expect(body.position).toBe(3);
    const w = buildPayload(words, { ...toFormValues(words.fields, null), vocabulary_category_id: "" }).word as Record<string, unknown>;
    expect(w.vocabulary_category_id).toBeNull();
  });
});
