import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }))));
    await expect(apiFetch("/health")).resolves.toEqual({ status: "ok" });
  });

  it("throws ApiError with the standard error shape", async () => {
    const body = { error: { code: "not_found", message: "Resource not found" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 404 })));
    await expect(apiFetch("/x")).rejects.toMatchObject({ status: 404, code: "not_found" });
    await expect(apiFetch("/x")).rejects.toBeInstanceOf(ApiError);
  });
});
