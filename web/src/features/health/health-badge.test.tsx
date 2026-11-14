import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HealthBadge } from "./health-badge";

afterEach(() => vi.unstubAllGlobals());

it("shows the API status once loaded", async () => {
  const body = { status: "ok", database: true };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
  render(<HealthBadge />);
  expect(await screen.findByText(/API ok · database up/)).toBeInTheDocument();
});
