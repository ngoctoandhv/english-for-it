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

  it("turns one-choice-per-line text into an array and numbers into numbers for listening questions", () => {
    const listening = findResource("listening")!;
    const values = toFormValues(listening.fields, { title: "T", questions: [{ id: 3, prompt: "Q", choices: ["a", "b"], correct_index: 1 }] });
    expect((values.listening_questions as Record<string, unknown>[])[0].choices).toBe("a\nb");
    (values.listening_questions as Record<string, unknown>[]).push({ prompt: "N", choices: " x \n\n y ", correct_index: "0" });
    const attrs = (buildPayload(listening, values).listening as Record<string, unknown>).listening_questions_attributes as Record<string, unknown>[];
    expect(attrs[0]).toMatchObject({ id: 3, choices: ["a", "b"], correct_index: 1 });
    expect(attrs[1]).toMatchObject({ choices: ["x", "y"], correct_index: 0 });
  });

  it("numbers scenario lines by their order and defaults select fields", () => {
    const scenarios = findResource("scenarios")!;
    const values = toFormValues(scenarios.fields, null);
    values.title = "T";
    values.scenario_dialogues = [
      { id: 1, speaker: "A", role: "other", text_en: "x" },
      { id: 2, _destroy: true },
      { speaker: "B", text_en: "y" },
    ];
    const attrs = (buildPayload(scenarios, values).scenario as Record<string, unknown>).scenario_dialogues_attributes as Record<string, unknown>[];
    expect(attrs.map((a) => a.position)).toEqual([0, undefined, 1]);
    expect(attrs[2].role).toBe("other");
  });
});
