import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchError } from "ofetch";

const { httpClientMock } = vi.hoisted(() => ({
  httpClientMock: vi.fn(),
}));

vi.mock("@/shared/api/http-client", () => ({
  configureHttpAuth: vi.fn(() => vi.fn()),
  httpClient: httpClientMock,
}));

import { authSession } from "./auth-session";
import {
  clearSession,
  logoutSession,
  refreshSession,
  restoreSession,
  stopSessionManager,
} from "./session-manager";

const meDto = {
  accessExpiresAt: Math.floor(Date.now() / 1_000) + 60,
  user: { id: "user-1", email: "user@example.com", firstName: "Ada", lastName: "Lovelace" },
};

describe("session manager", () => {
  afterEach(() => {
    stopSessionManager();
    authSession.reset();
    httpClientMock.mockReset();
    vi.useRealTimers();
  });

  it("shares one refresh request between concurrent consumers", async () => {
    httpClientMock.mockResolvedValue({ accessExpiresAt: Math.floor(Date.now() / 1_000) + 60 });

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
    httpClientMock.mockResolvedValue({ accessExpiresAt: Math.floor(Date.now() / 1_000) + 60 });

    await refreshSession();
    expect(httpClientMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(httpClientMock).toHaveBeenCalledTimes(2);
  });

  it("restores a valid access session through me without refreshing", async () => {
    httpClientMock.mockResolvedValue(meDto);

    const result = await restoreSession();

    expect(result?.user.id).toBe("user-1");
    expect(httpClientMock).toHaveBeenCalledOnce();
    expect(httpClientMock).toHaveBeenCalledWith("/v1/auth/me", { auth: "none" });
    expect(authSession.getSnapshot().status).toBe("authenticated");
  });

  it("refreshes only after me rejects an expired access token", async () => {
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    httpClientMock
      .mockRejectedValueOnce(unauthorized)
      .mockResolvedValueOnce({ accessExpiresAt: Math.floor(Date.now() / 1_000) + 60 })
      .mockResolvedValueOnce(meDto);

    await restoreSession();

    expect(httpClientMock).toHaveBeenNthCalledWith(1, "/v1/auth/me", { auth: "none" });
    expect(httpClientMock).toHaveBeenNthCalledWith(2, "/v1/auth/refresh", {
      method: "POST",
      auth: "none",
    });
    expect(httpClientMock).toHaveBeenNthCalledWith(3, "/v1/auth/me", { auth: "none" });
  });

  it("logs out on the backend before clearing local session metadata", async () => {
    authSession.authenticate({ accessExpiresAt: Date.now() + 60_000 });
    httpClientMock.mockResolvedValue(undefined);

    await logoutSession();

    expect(httpClientMock).toHaveBeenCalledWith("/v1/auth/logout", { method: "POST" });
    expect(authSession.getSnapshot()).toEqual({ status: "anonymous" });
  });

  it("clears session metadata without trying to access cookies", () => {
    authSession.authenticate({ accessExpiresAt: Date.now() + 60_000 });

    clearSession();

    expect(authSession.getSnapshot()).toEqual({ status: "anonymous" });
  });
});
