import { describe, expect, it } from "vitest";
import { dictionaries } from "./dictionaries";
import { translate } from "./provider";

describe("i18n", () => {
  it("has the same keys in English and Vietnamese", () => {
    expect(Object.keys(dictionaries.vi).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  it("keeps placeholders identical across languages", () => {
    const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(dictionaries.en)) {
      expect(names(dictionaries.vi[key]), key).toEqual(names(dictionaries.en[key]));
    }
  });

  it("interpolates parameters", () => {
    expect(translate("en", "learn.cardOf", { n: 2, total: 5 })).toBe("2 of 5");
    expect(translate("vi", "learn.cardOf", { n: 2, total: 5 })).toBe("2/5");
  });

  it("picks singular and plural forms by count", () => {
    expect(translate("en", "learn.reviewed", { count: 1 })).toBe("You reviewed 1 card.");
    expect(translate("en", "learn.reviewed", { count: 3 })).toBe("You reviewed 3 cards.");
    expect(translate("en", "learn.seeDays", { count: 1 })).toBe("See it again in 1 day.");
    expect(translate("en", "learn.seeDays", { count: 4 })).toBe("See it again in 4 days.");
  });

  it("falls back to the key when a string is missing", () => {
    expect(translate("vi", "does.not.exist")).toBe("does.not.exist");
  });
});
