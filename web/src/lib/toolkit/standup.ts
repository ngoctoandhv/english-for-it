import { clean, joinList } from "./text";

export type Verb = { base: string; past: string; vi: string };

// Common verbs for developer standups, with the past form the learner needs and a Vietnamese gloss.
export const VERBS: Verb[] = [
  { base: "fix", past: "fixed", vi: "sửa lỗi" },
  { base: "review", past: "reviewed", vi: "xem xét, review" },
  { base: "write", past: "wrote", vi: "viết" },
  { base: "test", past: "tested", vi: "kiểm thử" },
  { base: "deploy", past: "deployed", vi: "triển khai" },
  { base: "merge", past: "merged", vi: "gộp (nhánh)" },
  { base: "investigate", past: "investigated", vi: "điều tra" },
  { base: "update", past: "updated", vi: "cập nhật" },
  { base: "refactor", past: "refactored", vi: "tái cấu trúc" },
  { base: "finish", past: "finished", vi: "hoàn thành" },
  { base: "start", past: "started", vi: "bắt đầu" },
  { base: "continue", past: "continued", vi: "tiếp tục" },
  { base: "design", past: "designed", vi: "thiết kế" },
  { base: "implement", past: "implemented", vi: "triển khai (code)" },
  { base: "debug", past: "debugged", vi: "gỡ lỗi" },
  { base: "release", past: "released", vi: "phát hành" },
  { base: "document", past: "documented", vi: "viết tài liệu" },
  { base: "discuss", past: "discussed", vi: "thảo luận" },
  { base: "plan", past: "planned", vi: "lên kế hoạch" },
  { base: "migrate", past: "migrated", vi: "di chuyển dữ liệu" },
  { base: "create", past: "created", vi: "tạo" },
  { base: "set up", past: "set up", vi: "thiết lập" },
  { base: "work on", past: "worked on", vi: "làm việc trên" },
  { base: "look into", past: "looked into", vi: "tìm hiểu" },
  { base: "meet with", past: "met with", vi: "họp với" },
];

export type Item = { verb: string; object: string };
export type StandupInput = { yesterday: Item[]; today: Item[]; blockers: string[]; noBlockers: boolean };

const verbOf = (base: string) => VERBS.find((v) => v.base === base);

function clauses(items: Item[], form: "past" | "base"): string[] {
  return items.flatMap((item) => {
    const verb = verbOf(item.verb);
    if (!verb) return [];
    return [`${form === "past" ? verb.past : verb.base} ${clean(item.object)}`.trim()];
  });
}

/** Builds the three sentences of a standup update. Only the sentences with content are included. */
export function renderStandup(input: StandupInput): string {
  const lines: string[] = [];
  const yesterday = clauses(input.yesterday, "past");
  const today = clauses(input.today, "base");
  if (yesterday.length) lines.push(`Yesterday I ${joinList(yesterday)}.`);
  if (today.length) lines.push(`Today I will ${joinList(today)}.`);

  const blockers = input.blockers.map(clean).filter(Boolean);
  if (input.noBlockers || (blockers.length === 0 && (yesterday.length || today.length))) lines.push("I have no blockers.");
  else if (blockers.length) lines.push(`I am blocked by ${joinList(blockers)}.`);
  return lines.join("\n");
}
