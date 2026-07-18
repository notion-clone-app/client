import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { ROUTES } from "@/shared/model";
import { RequireAuth } from "./require-auth";
import { RequireGuest } from "./require-guest";
import type { Session } from "./session/session.entity";
import { sessionQueryKey } from "./session/session.query";

type AuthNavigationState = Readonly<{
  from?: Readonly<{ pathname: string }>;
}>;

function LoginProbe() {
  const location = useLocation();
  const state = location.state as AuthNavigationState | null;

  return <p>login from: {state?.from?.pathname ?? "unknown"}</p>;
}

const authenticatedSession: Session = {
  accessExpiresAt: Date.now() + 60_000,
  viewer: {
    id: "user-1",
    email: "user@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
  },
};

function withSession(children: React.ReactNode, session: Session | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(sessionQueryKey, session);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("identity access guards", () => {
  it("redirects an anonymous user from workspace to login and preserves the destination", async () => {
    render(
      withSession(
        <MemoryRouter initialEntries={[ROUTES.WORKSPACE]}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
            </Route>
            <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
          </Routes>
        </MemoryRouter>,
        null,
      ),
    );

    expect(await screen.findByText(`login from: ${ROUTES.WORKSPACE}`)).toBeInTheDocument();
    expect(screen.queryByText("workspace")).not.toBeInTheDocument();
  });

  it("allows an authenticated user to open workspace", () => {
    render(
      withSession(
        <MemoryRouter initialEntries={[ROUTES.WORKSPACE]}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
            </Route>
          </Routes>
        </MemoryRouter>,
        authenticatedSession,
      ),
    );

    expect(screen.getByText("workspace")).toBeInTheDocument();
  });

  it.each([ROUTES.LOGIN, ROUTES.REGISTRATION])(
    "redirects an authenticated user away from %s",
    async (guestRoute) => {
      render(
        withSession(
          <MemoryRouter initialEntries={[guestRoute]}>
            <Routes>
              <Route element={<RequireGuest />}>
                <Route path={guestRoute} element={<p>guest page</p>} />
              </Route>
              <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
            </Routes>
          </MemoryRouter>,
          authenticatedSession,
        ),
      );

      expect(await screen.findByText("workspace")).toBeInTheDocument();
      expect(screen.queryByText("guest page")).not.toBeInTheDocument();
    },
  );

  it("allows an anonymous user to open registration", () => {
    render(
      withSession(
        <MemoryRouter initialEntries={[ROUTES.REGISTRATION]}>
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path={ROUTES.REGISTRATION} element={<p>registration</p>} />
            </Route>
          </Routes>
        </MemoryRouter>,
        null,
      ),
    );

    expect(screen.getByText("registration")).toBeInTheDocument();
  });
});
