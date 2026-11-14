import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "./push";

describe("urlBase64ToUint8Array", () => {
  it("decodes URL-safe base64 with and without padding", () => {
    expect(Array.from(urlBase64ToUint8Array("AQID"))).toEqual([1, 2, 3]);
    expect(Array.from(urlBase64ToUint8Array("-_8"))).toEqual([251, 255]);
    expect(Array.from(urlBase64ToUint8Array("-_8="))).toEqual([251, 255]);
  });

  it("returns an empty array for an empty key", () => {
    expect(urlBase64ToUint8Array("").length).toBe(0);
  });
});
