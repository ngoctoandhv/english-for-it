// Declarative admin resources. The generic list/form components render these; no per-resource screens.
export type Option = { value: string; label: string };

export type FieldDef =
  | { kind: "text" | "textarea" | "number" | "lines"; name: string; label: string; required?: boolean; hint?: string }
  | { kind: "select"; name: string; label: string; options: Option[]; required?: boolean }
  | { kind: "remote-select"; name: string; label: string; source: string; labelKey: string }
  | { kind: "id-picker"; name: string; label: string; source: string; labelKey: string }
  | { kind: "list"; name: string; responseKey: string; label: string; itemLabel: string; fields: FieldDef[] };

export type ResourceConfig = {
  key: string;
  label: string;
  path: string;
  paramKey: string;
  columns: { label: string; value: (r: Record<string, unknown>) => string }[];
  fields: FieldDef[];
  hasAudio?: boolean;
};

const STATUS: Option[] = [
  { value: "draft", label: "Draft" },
  { value: "reviewed", label: "Reviewed" },
  { value: "published", label: "Published" },
];
const str = (v: unknown) => (v == null ? "" : String(v));

export const RESOURCES: ResourceConfig[] = [
  {
    key: "words",
    label: "Vocabulary",
    path: "words",
    paramKey: "word",
    hasAudio: true,
    columns: [
      { label: "Term", value: (r) => str(r.term) },
      { label: "Type", value: (r) => str(r.part_of_speech) },
      { label: "Meaning", value: (r) => str(r.meaning_vi) },
      { label: "Status", value: (r) => str(r.status) },
    ],
    fields: [
      { kind: "text", name: "term", label: "Term", required: true },
      { kind: "text", name: "ipa", label: "IPA", hint: "e.g. /kəˈmɪt/" },
      {
        kind: "select", name: "part_of_speech", label: "Part of speech", required: true,
        options: ["noun", "verb", "adjective", "adverb", "phrase"].map((v) => ({ value: v, label: v })),
      },
      { kind: "text", name: "meaning_vi", label: "Vietnamese meaning", required: true },
      { kind: "textarea", name: "definition_en", label: "Simple English definition", required: true },
      { kind: "remote-select", name: "vocabulary_category_id", label: "Category", source: "categories", labelKey: "name" },
      { kind: "select", name: "status", label: "Status", options: STATUS, required: true },
      {
        kind: "list", name: "vocabulary_examples", responseKey: "examples", label: "Examples", itemLabel: "example",
        fields: [
          { kind: "text", name: "sentence_en", label: "Sentence (English)", required: true },
          { kind: "text", name: "translation_vi", label: "Vietnamese translation", required: true },
        ],
      },
      {
        kind: "list", name: "vocabulary_collocations", responseKey: "collocations", label: "Collocations", itemLabel: "collocation",
        fields: [{ kind: "text", name: "phrase", label: "Phrase", required: true }],
      },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    path: "categories",
    paramKey: "category",
    columns: [
      { label: "Name", value: (r) => str(r.name) },
      { label: "Slug", value: (r) => str(r.slug) },
    ],
    fields: [
      { kind: "text", name: "name", label: "Name", required: true },
      { kind: "text", name: "slug", label: "Slug", hint: "Leave empty to generate from the name" },
      { kind: "number", name: "position", label: "Position" },
    ],
  },
  {
    key: "collections",
    label: "Collections",
    path: "collections",
    paramKey: "collection",
    columns: [
      { label: "Title", value: (r) => str(r.title) },
      { label: "Words", value: (r) => str((r.word_ids as unknown[] | undefined)?.length ?? 0) },
      { label: "Status", value: (r) => str(r.status) },
    ],
    fields: [
      { kind: "text", name: "title", label: "Title", required: true },
      { kind: "text", name: "slug", label: "Slug" },
      { kind: "textarea", name: "description", label: "Description" },
      { kind: "select", name: "status", label: "Status", options: STATUS, required: true },
      { kind: "number", name: "position", label: "Position" },
      { kind: "id-picker", name: "word_ids", label: "Words (in order)", source: "words", labelKey: "term" },
    ],
  },
];

RESOURCES.push({
  key: "listening",
  label: "Listening lessons",
  path: "listening",
  paramKey: "listening",
  hasAudio: true,
  columns: [
    { label: "Title", value: (r) => str(r.title) },
    { label: "Level", value: (r) => str(r.level) },
    { label: "Questions", value: (r) => str(r.questions_count) },
    { label: "Status", value: (r) => str(r.status) },
  ],
  fields: [
    { kind: "text", name: "title", label: "Title", required: true },
    { kind: "textarea", name: "description", label: "Description" },
    { kind: "select", name: "level", label: "Level", required: true, options: ["beginner", "elementary", "intermediate"].map((v) => ({ value: v, label: v })) },
    { kind: "textarea", name: "transcript_en", label: "Transcript (English)", required: true },
    { kind: "textarea", name: "transcript_vi", label: "Transcript (Vietnamese)" },
    { kind: "number", name: "duration_seconds", label: "Duration (seconds)" },
    { kind: "number", name: "position", label: "Position" },
    { kind: "select", name: "status", label: "Status", options: STATUS, required: true },
    {
      kind: "list", name: "listening_questions", responseKey: "questions", label: "Questions", itemLabel: "question",
      fields: [
        { kind: "text", name: "prompt", label: "Question", required: true },
        { kind: "lines", name: "choices", label: "Choices (one per line)", hint: "At least two" },
        { kind: "number", name: "correct_index", label: "Correct choice number (0 = first line)" },
        { kind: "text", name: "explanation", label: "Explanation (optional)" },
      ],
    },
  ],
});

export const findResource = (key: string) => RESOURCES.find((r) => r.key === key);
