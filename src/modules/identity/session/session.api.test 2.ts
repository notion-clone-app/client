import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchError } from "ofetch";

const { httpClientMock } = vi.hoisted(() => ({ httpClientMock: vi.fn() }));

vi.mock("@/shared/api/http-client", () => ({ httpClient: httpClientMock }));

import { getSession, logoutSession, refreshSession } from "./session.api";

describe("session API", () => {
  afterEach(() => {
    httpClientMock.mockReset();
  });

  it("maps the authenticated viewer without exposing token values", async () => {
    httpClientMock.mockResolvedValue({
      accessExpiresAt: 1_800_000_000,
      user: {
        id: "user-1",
        email: "user@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
      },
    });

    await expect(getSession()).resolves.toEqual({
      accessExpiresAt: 1_800_000_000_000,
      viewer: {
        id: "user-1",
        email: "user@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
      },
    });
  });

  it("represents an unauthorized response as an anonymous session", async () => {
    const unauthorized = Object.assign(new FetchError("Unauthorized"), { status: 401 });
    httpClientMock.mockRejectedValue(unauthorized);

    await expect(getSession()).resolves.toBeNull();
  });

  it("uses public recovery endpoint and protected logout endpoint", async () => {
    httpClientMock.mockResolvedValue(undefined);

    await refreshSession();
    await logoutSession();

    expect(httpClientMock).toHaveBeenNthCalledWith(1, "/v1/auth/refresh", {
      method: "POST",
      auth: "none",
    });
    expect(httpClientMock).toHaveBeenNthCalledWith(2, "/v1/auth/logout", { method: "POST" });
  });
});
