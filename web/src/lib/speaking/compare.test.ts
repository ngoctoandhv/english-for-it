import { describe, expect, it } from "vitest";
import { compareSpeech } from "./compare";

describe("compareSpeech", () => {
  it("scores an exact match as 100 and ignores case and punctuation", () => {
    const r = compareSpeech("I fixed the login bug.", "i fixed the login bug");
    expect(r.score).toBe(100);
    expect(r.words.every((w) => w.ok)).toBe(true);
    expect(r.extra).toEqual([]);
  });

  it("marks missing and wrong words and lists extra words", () => {
    const r = compareSpeech("I will review the pull request", "I will check the pull request today");
    expect(r.words.map((w) => w.ok)).toEqual([true, true, false, true, true, true]);
    expect(r.extra).toEqual(["check", "today"]);
    expect(r.score).toBe(83);
  });

  it("treats a contraction and its expansion as the same words", () => {
    expect(compareSpeech("I'm blocked by the API", "I am blocked by the API").score).toBe(100);
    expect(compareSpeech("I am not sure", "I'm not sure").score).toBe(100);
  });

  it("does not let a repeated word shift the alignment", () => {
    const r = compareSpeech("the build is green", "the the build is green");
    expect(r.score).toBe(100);
    expect(r.extra).toEqual(["the"]);
  });

  it("scores silence as 0", () => {
    const r = compareSpeech("Any blockers?", "");
    expect(r.score).toBe(0);
    expect(r.words.every((w) => !w.ok)).toBe(true);
  });
});
