import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

const { configureHttpAuthMock, refreshSessionMock } = vi.hoisted(() => ({
  configureHttpAuthMock: vi.fn(),
  refreshSessionMock: vi.fn(),
}));

vi.mock("@/shared/api/http-client", () => ({ configureHttpAuth: configureHttpAuthMock }));
vi.mock("./session.api", () => ({ refreshSession: refreshSessionMock }));

import type { HttpAuthMiddleware } from "@/shared/api/http-client";
import { initializeIdentity, resetSessionRecovery } from "./session.recovery";
import { sessionQueryKey } from "./session.query";

describe("session recovery", () => {
  let middleware: HttpAuthMiddleware;

  afterEach(() => {
    configureHttpAuthMock.mockReset();
    refreshSessionMock.mockReset();
    resetSessionRecovery();
  });

  it("shares one refresh request between concurrent 401 responses", async () => {
    configureHttpAuthMock.mockImplementation((value: HttpAuthMiddleware) => {
      middleware = value;
      return vi.fn();
    });
    let resolveRefresh: (() => void) | undefined;
    refreshSessionMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    initializeIdentity(new QueryClient());

    const first = middleware.recoverUnauthorized();
    const second = middleware.recoverUnauthorized();
    resolveRefresh?.();

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(refreshSessionMock).toHaveBeenCalledOnce();
  });

  it("clears the cached session after refresh failure", async () => {
    configureHttpAuthMock.mockImplementation((value: HttpAuthMiddleware) => {
      middleware = value;
      return vi.fn();
    });
    refreshSessionMock.mockRejectedValue(new Error("refresh failed"));
    const queryClient = new QueryClient();
    queryClient.setQueryData(sessionQueryKey, { viewer: { id: "user-1" } });
    initializeIdentity(queryClient);

    await expect(middleware.recoverUnauthorized()).resolves.toBe(false);
    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
  });
});
