import { describe, expect, it } from "vitest";
import { adminText } from "./admin";
import { translate } from "./provider";

const vi = (key: string) => translate("vi", key);
const en = (key: string) => translate("en", key);

describe("adminText", () => {
  it("translates known field labels, options and hints", () => {
    expect(adminText(vi, "Vietnamese meaning")).toBe("Nghĩa tiếng Việt");
    expect(adminText(vi, "Draft")).toBe("Nháp");
    expect(adminText(vi, "Choices (one per line)")).toBe("Các lựa chọn (mỗi dòng một lựa chọn)");
    expect(adminText(en, "Part of speech")).toBe("Part of speech");
  });

  it("returns unknown text unchanged", () => {
    expect(adminText(vi, "Something new")).toBe("Something new");
  });
});
