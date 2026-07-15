import { afterEach, describe, expect, it, vi } from "vitest";
import { authSession } from "./auth-session";
import { mapAuthSessionDto } from "./auth-session.dto";

describe("auth session", () => {
  afterEach(() => {
    authSession.clear();
    vi.useRealTimers();
  });

  it("maps relative expiration values to timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:00:00Z"));

    const session = mapAuthSessionDto({
      accessToken: "access",
      refreshToken: "refresh",
      accessExpiresIn: 60,
      refreshExpiresIn: 3_600,
    });

    expect(session.accessExpiresAt).toBe(Date.now() + 60_000);
    expect(session.refreshExpiresAt).toBe(Date.now() + 3_600_000);
  });

  it("stores and clears the current session", () => {
    const session = {
      accessToken: "access",
      refreshToken: "refresh",
      accessExpiresAt: 1,
      refreshExpiresAt: 2,
    };

    authSession.set(session);
    expect(authSession.get()).toEqual(session);

    authSession.clear();
    expect(authSession.get()).toBeNull();
  });
});
