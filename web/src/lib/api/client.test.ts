import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tokenStore } from "@/lib/auth/token-store";
import { ApiError, apiFetch } from "./client";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ status: "ok" })));
    await expect(apiFetch("/health")).resolves.toEqual({ status: "ok" });
  });

  it("throws ApiError with the standard error shape", async () => {
    const body = { error: { code: "not_found", message: "Resource not found" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(body, 404)));
    await expect(apiFetch("/x")).rejects.toMatchObject({ status: 404, code: "not_found" });
    await expect(apiFetch("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("sends the bearer token", async () => {
    tokenStore.set({ accessToken: "a1", refreshToken: "r1" });
    const fetchMock = vi.fn().mockResolvedValue(json({}));
    vi.stubGlobal("fetch", fetchMock);
    await apiFetch("/me");
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe("Bearer a1");
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    tokenStore.set({ accessToken: "old", refreshToken: "r1" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ error: { code: "unauthorized", message: "x" } }, 401))
      .mockResolvedValueOnce(json({ access_token: "new", refresh_token: "r2" }))
      .mockResolvedValueOnce(json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/me")).resolves.toEqual({ ok: true });
    expect(tokenStore.get()).toEqual({ accessToken: "new", refreshToken: "r2" });
    expect((fetchMock.mock.calls[2][1].headers as Record<string, string>).Authorization).toBe("Bearer new");
  });
});
