import { afterEach, describe, expect, it, vi } from "vitest";

const { httpClientMock } = vi.hoisted(() => ({
  httpClientMock: vi.fn(),
}));

vi.mock("@/shared/api/http-client", () => ({
  configureHttpAuth: vi.fn(() => vi.fn()),
  httpClient: httpClientMock,
}));

import { authSession } from "./auth-session";
import { clearSession, refreshSession, stopSessionManager } from "./session-manager";

describe("session manager", () => {
  afterEach(() => {
    stopSessionManager();
    authSession.reset();
    httpClientMock.mockReset();
    vi.useRealTimers();
  });

  it("shares one refresh request between concurrent consumers", async () => {
    httpClientMock.mockResolvedValue({ accessExpiresIn: 60 });

    const first = refreshSession();
    const second = refreshSession();

    expect(first).toBe(second);
    const session = await first;
    expect(typeof session.accessExpiresAt).toBe("number");
    expect(httpClientMock).toHaveBeenCalledTimes(1);
    expect(httpClientMock).toHaveBeenCalledWith("/v1/auth/refresh", {
      method: "POST",
      auth: "none",
    });
  });

  it("refreshes shortly before access expiration", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:00:00Z"));
    httpClientMock.mockResolvedValue({ accessExpiresIn: 60 });

    await refreshSession();
    expect(httpClientMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(httpClientMock).toHaveBeenCalledTimes(2);
  });

  it("clears session metadata without trying to access cookies", () => {
    authSession.authenticate({ accessExpiresAt: Date.now() + 60_000 });

    clearSession();

    expect(authSession.getSnapshot()).toEqual({ status: "anonymous" });
  });
});
