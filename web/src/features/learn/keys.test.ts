import { describe, expect, it } from "vitest";
import { actionForKey } from "./keys";

describe("actionForKey", () => {
  it("reveals with Space/Enter before the answer is shown and ignores rating keys", () => {
    expect(actionForKey(" ", false)).toEqual({ type: "reveal" });
    expect(actionForKey("Enter", false)).toEqual({ type: "reveal" });
    expect(actionForKey("3", false)).toBeNull();
  });

  it("maps 1-4 to ratings after reveal and Space to Good", () => {
    expect(actionForKey("1", true)).toEqual({ type: "rate", rating: "again" });
    expect(actionForKey("2", true)).toEqual({ type: "rate", rating: "hard" });
    expect(actionForKey("3", true)).toEqual({ type: "rate", rating: "good" });
    expect(actionForKey("4", true)).toEqual({ type: "rate", rating: "easy" });
    expect(actionForKey(" ", true)).toEqual({ type: "rate", rating: "good" });
  });

  it("plays audio with P at any time and ignores other keys", () => {
    expect(actionForKey("p", false)).toEqual({ type: "play" });
    expect(actionForKey("x", true)).toBeNull();
  });
});
