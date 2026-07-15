import { afterEach, describe, expect, it, vi } from "vitest";

const { createMock, transportMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  transportMock: vi.fn(),
}));

vi.mock("ofetch", () => {
  class MockFetchError extends Error {
    status?: number;
  }

  createMock.mockReturnValue(transportMock);

  return {
    FetchError: MockFetchError,
    ofetch: { create: createMock },
  };
});

import { FetchError } from "ofetch";
import { configureHttpAuth, httpClient } from "./http-client";

describe("http client auth middleware", () => {
  afterEach(() => {
    transportMock.mockReset();
  });

  it("configures cookie credentials at the transport boundary", () => {
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ credentials: "include", retry: 0 }),
    );
  });

  it("prepares a required session before a request", async () => {
    const prepare = vi.fn().mockResolvedValue(undefined);
    const recoverUnauthorized = vi.fn().mockResolvedValue(false);
    const uninstall = configureHttpAuth({ prepare, recoverUnauthorized });
    transportMock.mockResolvedValue({ id: "workspace" });

    await expect(httpClient("/v1/workspaces")).resolves.toEqual({ id: "workspace" });
    expect(prepare).toHaveBeenCalledWith("required");
    uninstall();
  });

  it("refreshes and retries a request once after 401", async () => {
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    const recoverUnauthorized = vi.fn().mockResolvedValue(true);
    const uninstall = configureHttpAuth({
      prepare: vi.fn().mockResolvedValue(undefined),
      recoverUnauthorized,
    });
    transportMock.mockRejectedValueOnce(unauthorized).mockResolvedValueOnce({ ok: true });

    await expect(httpClient("/v1/workspaces")).resolves.toEqual({ ok: true });
    expect(recoverUnauthorized).toHaveBeenCalledOnce();
    expect(transportMock).toHaveBeenCalledTimes(2);
    uninstall();
  });

  it("does not invoke auth recovery for a public request", async () => {
    const prepare = vi.fn().mockResolvedValue(undefined);
    const recoverUnauthorized = vi.fn().mockResolvedValue(true);
    const uninstall = configureHttpAuth({ prepare, recoverUnauthorized });
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    transportMock.mockRejectedValue(unauthorized);

    await expect(httpClient("/v1/auth/login", { auth: "none" })).rejects.toBe(unauthorized);
    expect(prepare).not.toHaveBeenCalled();
    expect(recoverUnauthorized).not.toHaveBeenCalled();
    expect(transportMock).toHaveBeenCalledOnce();
    uninstall();
  });
});
