import { describe, expect, it } from "vitest";
import { stepHref, type PathStep } from "./path";

const base = { id: 1, title: null, done: 0, total: 1, complete: false };

describe("stepHref", () => {
  it("sends each step kind to the right screen", () => {
    expect(stepHref({ ...base, kind: "words", target: { collection: "daily-standup" } } as PathStep, "u")).toBe("/learn?collection=daily-standup");
    expect(stepHref({ ...base, kind: "listening", target: { lesson_id: 7 } } as PathStep, "u")).toBe("/listening/7");
    expect(stepHref({ ...base, kind: "scenario", target: { scenario: "code-review" } } as PathStep, "u")).toBe("/scenarios/code-review");
    expect(stepHref({ ...base, kind: "quiz", target: { unit: "daily-standup" } } as PathStep, "daily-standup")).toBe("/path/daily-standup/quiz");
  });
});
