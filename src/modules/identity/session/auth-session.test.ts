import { afterEach, describe, expect, it, vi } from "vitest";
import { authSession } from "./auth-session";
import { mapAuthSessionDto } from "./auth-session.dto";

describe("auth session", () => {
  afterEach(() => {
    authSession.reset();
    vi.useRealTimers();
  });

  it("stores only non-secret access expiration metadata", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:00:00Z"));

    const session = mapAuthSessionDto({ accessExpiresIn: 60 });

    expect(session).toEqual({ accessExpiresAt: Date.now() + 60_000 });
    expect(session).not.toHaveProperty("accessToken");
    expect(session).not.toHaveProperty("refreshToken");
  });

  it("publishes authenticated and anonymous states", () => {
    const listener = vi.fn();
    const unsubscribe = authSession.subscribe(listener);

    authSession.authenticate({ accessExpiresAt: 1 });
    expect(authSession.getSnapshot()).toEqual({
      status: "authenticated",
      session: { accessExpiresAt: 1 },
    });

    authSession.clear();
    expect(authSession.getSnapshot()).toEqual({ status: "anonymous" });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
