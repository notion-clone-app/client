# Authentication contract

The browser uses cookie-based authentication. JavaScript never receives or stores access and
refresh token values. The client keeps only non-secret expiration metadata so it can refresh the
session before the access cookie expires.

## Cookies owned by the backend

Recommended production attributes:

| Cookie                   | Purpose                | Suggested attributes                                        |
| ------------------------ | ---------------------- | ----------------------------------------------------------- |
| `__Secure-access_token`  | Short-lived API access | `HttpOnly; Secure; SameSite=Lax; Path=/api`                 |
| `__Secure-refresh_token` | Session renewal        | `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh` |

`SameSite=Strict` is preferable when external SSO redirects and cross-site entry flows are not
required. Cookie `Path` reduces where a cookie is sent, but is not an authorization boundary.

The backend must rotate the refresh token on every successful refresh. The previous token is
invalidated immediately; reuse should revoke the entire token family. Logout and password/security
events revoke the server-side session and expire both cookies.

## Endpoints

Login and registration set both cookies and return only expiration metadata:

```json
{
  "accessExpiresIn": 900
}
```

- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `POST /v1/auth/refresh` — rotates refresh and access cookies and returns the same DTO
- `POST /v1/auth/logout` — revokes the session and expires both cookies

The client calculates `accessExpiresAt = Date.now() + accessExpiresIn * 1000`. This value is not a
security decision: the backend remains responsible for validating token expiration and revocation.

## Client request flow

1. `ofetch` uses `credentials: "include"`; the browser attaches matching cookies automatically.
2. Public identity endpoints use `auth: "none"` and never start refresh recovery.
3. A required request refreshes proactively 30 seconds before `accessExpiresAt`.
4. Concurrent refresh attempts share one promise.
5. After a `401`, the client refreshes once and retries the original request once.
6. A failed recovery clears only in-memory session metadata and lets the auth guard redirect.
7. A `403` does not refresh the session: it means the authenticated principal lacks permission.

There is intentionally no `Authorization` interceptor. An `HttpOnly` token cannot be read by
JavaScript, so it cannot be copied into a request header.

## Backend requirements

- HTTPS in production.
- If API and UI are cross-origin: an explicit allowed origin, `Access-Control-Allow-Credentials:
true`, and no wildcard origin.
- CSRF protection for state-changing cookie-authenticated requests. At minimum validate `Origin`
  and Fetch Metadata headers and use an explicit CSRF token where cross-site scenarios require it.
- Short access lifetime and bounded refresh/session lifetime.
- Refresh token rotation and reuse detection.
- `401` for an absent, expired, or invalid session; `403` for a valid session without permission.
