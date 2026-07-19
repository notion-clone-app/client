# Notion Client

A modular React client for a Notion-inspired workspace platform. The repository currently contains
the marketing website, cookie-based authentication, protected routing, and the initial workspace
context. The codebase is organized around business contexts so documents, permissions, SSO, and
additional applications can evolve without turning the UI into one global feature tree.

Architecture boundaries, layer rules and naming conventions are defined in the
[client architecture style guide](docs/ARCHITECTURE_STYLE_GUIDE.md).

## Technology

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query for server state and API cache
- ofetch for HTTP transport
- React Hook Form and Zod for forms and validation
- Tailwind CSS
- Vitest and Testing Library
- ESLint, Prettier, Knip, and TypeScript project checks

## Architecture

Application code is split into business contexts under `src/modules`:

```text
src/
├── app/                 Application composition, routing, and providers
├── modules/
│   ├── identity/        Login, registration, session, logout, and access guards
│   ├── marketing/       Public landing pages and marketing content
│   ├── workspace/       Protected workspace shell and dashboard
│   └── documents/       Document context placeholder
└── shared/              Context-independent API, UI, theme, and utility code
```

Contexts expose their supported public API through `index.ts`. Imports into another context must use
that public entry point; deep cross-context imports are rejected by ESLint. `shared` cannot depend on
application contexts.

### State ownership

- TanStack Query owns data received from the backend.
- React Hook Form owns form state.
- React Router owns navigation state.
- Component state owns local presentation state.
- HttpOnly cookies owned by the backend contain access and refresh tokens.

There is intentionally no global client state manager. A document editor may introduce an isolated
store later for high-frequency local editing state, while durable offline drafts should live in an
IndexedDB-backed repository rather than an in-memory store.

## Authentication

The browser never reads or stores JWT values. ofetch sends matching HttpOnly cookies with
`credentials: "include"`.

The `identity/session` query is the only source of client authentication state:

1. `GET /v1/auth/me` returns the current viewer and access expiration.
2. A `401` from a protected request starts one shared `POST /v1/auth/refresh` request.
3. Concurrent failed requests wait for the same refresh promise.
4. After successful refresh, each original request is retried once.
5. Failed refresh changes the cached session to `null` and access guards redirect to Login.
6. Login and registration reload `/me` after the backend installs cookies.
7. Logout revokes the backend session, expires cookies, and clears the session query.

See [docs/authentication.md](docs/authentication.md) for the complete client/backend contract and
production security requirements.

## Local development

Requirements:

- Node.js supported by the current Vite version
- pnpm 9
- API gateway available locally

Install dependencies and configure the API URL:

```bash
pnpm install
cp .env.example .env
```

The default configuration expects the gateway at `http://localhost:8080`.

Start the development server:

```bash
pnpm dev
```

## Quality commands

```bash
pnpm format:check   # Verify formatting
pnpm lint           # Run type-aware ESLint rules
pnpm typecheck      # Compile all TypeScript projects
pnpm test:run       # Run tests once
pnpm test:coverage  # Run tests with coverage
pnpm knip           # Detect unused files, dependencies, and exports
pnpm build          # Create the production bundle
pnpm quality        # Run the complete local quality gate
```

The same quality gate runs in GitHub Actions. Dependency changes are additionally checked by the
dependency review workflow.

## Backend contract

The client expects the API gateway to expose:

| Method | Endpoint            | Authentication | Purpose                        |
| ------ | ------------------- | -------------- | ------------------------------ |
| POST   | `/v1/auth/login`    | Public         | Create a browser session       |
| POST   | `/v1/auth/register` | Public         | Register and create a session  |
| GET    | `/v1/auth/me`       | Access token   | Read the authenticated viewer  |
| POST   | `/v1/auth/refresh`  | Refresh token  | Rotate the browser session     |
| POST   | `/v1/auth/logout`   | Access token   | Revoke the session and cookies |

Authentication requirements are declared per RPC through protobuf method options. The policy
contract already reserves workspace permission names for future authorization rules.
