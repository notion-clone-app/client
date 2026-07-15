import {
  configureHttpAuth,
  httpClient,
  type AuthMode,
  type HttpAuthMiddleware,
} from "@/shared/api/http-client";
import { authSession, type AuthSession } from "./auth-session";
import { mapAuthSessionDto, type AuthSessionDto } from "./auth-session.dto";
import { getCurrentUser } from "../current-user/current-user.api";
import { FetchError } from "ofetch";

const REFRESH_AHEAD_MS = 30_000;
const REFRESH_RETRY_MS = 5_000;
const MAX_TIMEOUT_MS = 2_147_483_647;

class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required");
    this.name = "AuthenticationRequiredError";
  }
}

let refreshPromise: Promise<AuthSession> | null = null;
let restorePromise: Promise<Awaited<ReturnType<typeof getCurrentUser>> | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function clearRefreshTimer() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
}

function scheduleRefresh(session: AuthSession, delay?: number) {
  clearRefreshTimer();
  const refreshIn = delay ?? Math.max(0, session.accessExpiresAt - Date.now() - REFRESH_AHEAD_MS);

  refreshTimer = setTimeout(
    () => {
      void refreshSession().catch(() => {
        const snapshot = authSession.getSnapshot();
        if (snapshot.status !== "authenticated") return;

        if (snapshot.session.accessExpiresAt <= Date.now()) {
          clearSession();
          return;
        }

        scheduleRefresh(snapshot.session, REFRESH_RETRY_MS);
      });
    },
    Math.min(refreshIn, MAX_TIMEOUT_MS),
  );
}

export function acceptSession(session: AuthSession) {
  authSession.authenticate(session);
  scheduleRefresh(session);
}

export function clearSession() {
  clearRefreshTimer();
  authSession.clear();
}

export function refreshSession(): Promise<AuthSession> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = httpClient<AuthSessionDto>("/v1/auth/refresh", {
    method: "POST",
    auth: "none",
  })
    .then(mapAuthSessionDto)
    .then((session) => {
      acceptSession(session);
      return session;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function restoreSession() {
  if (restorePromise) return restorePromise;

  restorePromise = performSessionRestore().finally(() => {
    restorePromise = null;
  });
  return restorePromise;
}

async function performSessionRestore() {
  try {
    return await loadCurrentUser("none");
  } catch (error) {
    if (!(error instanceof FetchError) || error.status !== 401) {
      clearSession();
      return null;
    }
  }

  try {
    await refreshSession();
    return await loadCurrentUser("none");
  } catch {
    clearSession();
    return null;
  }
}

export async function loadCurrentUser(auth: AuthMode = "required") {
  const result = await getCurrentUser(auth);
  acceptSession(result.session);
  return result;
}

export async function logoutSession() {
  try {
    await httpClient<void>("/v1/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

async function prepareSession(mode: Exclude<AuthMode, "none">) {
  const snapshot = authSession.getSnapshot();

  if (snapshot.status === "unknown" && mode === "required") {
    await restoreSession();
    if (authSession.getSnapshot().status !== "authenticated") {
      throw new AuthenticationRequiredError();
    }
    return;
  }

  if (snapshot.status !== "authenticated") return;
  if (snapshot.session.accessExpiresAt - Date.now() > REFRESH_AHEAD_MS) return;

  try {
    await refreshSession();
  } catch {
    // The current access cookie may still be valid. A 401 response will trigger recovery.
  }
}

const httpAuthMiddleware: HttpAuthMiddleware = {
  prepare: prepareSession,
  recoverUnauthorized: async () => {
    try {
      await refreshSession();
      return true;
    } catch {
      clearSession();
      return false;
    }
  },
};

export function installIdentityHttpAuth() {
  return configureHttpAuth(httpAuthMiddleware);
}

export function stopSessionManager() {
  clearRefreshTimer();
  refreshPromise = null;
  restorePromise = null;
}
