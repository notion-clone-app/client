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

  it("does not invoke recovery for a successful protected request", async () => {
    const recoverUnauthorized = vi.fn().mockResolvedValue(false);
    const uninstall = configureHttpAuth({ recoverUnauthorized });
    transportMock.mockResolvedValue({ id: "workspace" });

    await expect(httpClient("/v1/workspaces")).resolves.toEqual({ id: "workspace" });
    expect(recoverUnauthorized).not.toHaveBeenCalled();
    uninstall();
  });

  it("refreshes and retries a request once after 401", async () => {
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    const recoverUnauthorized = vi.fn().mockResolvedValue(true);
    const uninstall = configureHttpAuth({ recoverUnauthorized });
    transportMock.mockRejectedValueOnce(unauthorized).mockResolvedValueOnce({ ok: true });

    await expect(httpClient("/v1/workspaces")).resolves.toEqual({ ok: true });
    expect(recoverUnauthorized).toHaveBeenCalledOnce();
    expect(transportMock).toHaveBeenCalledTimes(2);
    uninstall();
  });

  it("does not invoke auth recovery for a public request", async () => {
    const recoverUnauthorized = vi.fn().mockResolvedValue(true);
    const uninstall = configureHttpAuth({ recoverUnauthorized });
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    transportMock.mockRejectedValue(unauthorized);

    await expect(httpClient("/v1/auth/login", { auth: "none" })).rejects.toBe(unauthorized);
    expect(recoverUnauthorized).not.toHaveBeenCalled();
    expect(transportMock).toHaveBeenCalledOnce();
    uninstall();
  });
});
