import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { ROUTES } from "@/shared/model";
import { RequireAuth } from "./require-auth";
import { RequireGuest } from "./require-guest";
import { authSession } from "./session/auth-session";

type AuthNavigationState = Readonly<{
  from?: Readonly<{ pathname: string }>;
}>;

function LoginProbe() {
  const location = useLocation();
  const state = location.state as AuthNavigationState | null;

  return <p>login from: {state?.from?.pathname ?? "unknown"}</p>;
}

describe("identity access guards", () => {
  afterEach(() => {
    authSession.reset();
  });

  it("redirects an anonymous user from workspace to login and preserves the destination", async () => {
    authSession.clear();

    render(
      <MemoryRouter initialEntries={[ROUTES.WORKSPACE]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
          </Route>
          <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(`login from: ${ROUTES.WORKSPACE}`)).toBeInTheDocument();
    expect(screen.queryByText("workspace")).not.toBeInTheDocument();
  });

  it("allows an authenticated user to open workspace", () => {
    authSession.authenticate({ accessExpiresAt: Date.now() + 60_000 });

    render(
      <MemoryRouter initialEntries={[ROUTES.WORKSPACE]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("workspace")).toBeInTheDocument();
  });

  it.each([ROUTES.LOGIN, ROUTES.REGISTRATION])(
    "redirects an authenticated user away from %s",
    async (guestRoute) => {
      authSession.authenticate({ accessExpiresAt: Date.now() + 60_000 });

      render(
        <MemoryRouter initialEntries={[guestRoute]}>
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path={guestRoute} element={<p>guest page</p>} />
            </Route>
            <Route path={ROUTES.WORKSPACE} element={<p>workspace</p>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("workspace")).toBeInTheDocument();
      expect(screen.queryByText("guest page")).not.toBeInTheDocument();
    },
  );

  it("allows an anonymous user to open registration", () => {
    authSession.clear();

    render(
      <MemoryRouter initialEntries={[ROUTES.REGISTRATION]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path={ROUTES.REGISTRATION} element={<p>registration</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("registration")).toBeInTheDocument();
  });
});
