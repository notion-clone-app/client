# Client architecture style guide

The client is a modular monolith organized by business context. A module is located by business
meaning first and by technical layer second. DDD is used to make business invariants explicit, not
to wrap every function in a class.

## Module shape

Production modules use only the layers they need:

```text
module/
├── domain/          Entities, value objects, policies and pure transitions
├── application/     Commands, queries, orchestration and persistence ports
├── infrastructure/  HTTP, IndexedDB and DTO adapters
├── presentation/    React providers, hooks, pages and components
└── index.ts          Public API available to other modules
```

Dependencies point inward. Domain code imports no React, routing, HTTP, TanStack Query, browser
storage or another context's private files. Infrastructure implements application ports. The app or
a route composition root connects adapters to presentation.

## Context boundaries

- Cross-module imports use the target module's public `index.ts` only.
- A context does not import another context's entity as its own aggregate state. Prefer an ID or a
  public immutable contract.
- `shared` contains business-agnostic capabilities used by at least two contexts.
- Do not create `common`, `utils` or `helpers` as destinations for unrelated code. Name the owner or
  responsibility instead.
- A persistence port is justified at an actual replaceable boundary such as API/IndexedDB. Do not
  create repository interfaces for in-memory component state.

## State ownership

- TanStack Query owns remote server state.
- IndexedDB owns durable local-first snapshots and pending operations.
- React state owns transient interaction state close to its consumer.
- React context exposes one narrow capability or stable dependency. It must not become an
  application-wide bag of unrelated commands.
- Never copy query data into a global client store merely to make it globally accessible.

## Domain and application code

- Domain transitions are pure and deterministic. Inject IDs, time and policies when tests need
  control over them.
- Application commands coordinate business transitions and ports but do not render UI.
- Prefer functions to one-method classes.
- A separate command/query is warranted when it enforces an invariant, coordinates dependencies or
  represents a user-visible operation. A repository getter does not need a ceremonial use case.
- API DTOs, storage records, domain entities and UI read models are different contracts and are
  mapped at boundaries.

## React composition

- A page reads route state, handles loading/error boundaries and composes meaningful sections.
- Business status transitions and multi-aggregate writes do not belong in page components.
- Extract a component when it has independent behavior, is reused or makes its parent materially
  easier to read. Keep one-use visual wrappers inline.
- Presentation hooks may translate React events to application commands. They do not become hidden
  domain services.
- Contextual providers are placed at the narrowest route that owns their lifetime.

## Naming

Use names that expose architectural responsibility:

```text
document.entity.ts
document-revision.entity.ts
publication.policy.ts
document-revision.repository.port.ts
document.dto.ts
document.mapper.ts
create-checkpoint.command.ts
get-document-history.query.ts
document-history.page.tsx
use-document-versioning.ts
```

Avoid vague suffixes such as `service` unless the object truly represents a cohesive domain or
application service.

## Documentation and tests

- JSDoc explains public contracts, business invariants and non-obvious constraints. It does not
  repeat the implementation.
- Domain tests cover invariants without React or storage.
- Application tests use in-memory/fake ports and cover orchestration.
- Infrastructure tests cover serialization, migrations and adapter behavior.
- Presentation tests cover user-visible behavior and accessibility.
- Every schema persisted in IndexedDB or sent over HTTP has an explicit version and migration path.

## Document versioning decision

The mutable document is a working copy. `DocumentRevision` is an immutable checkpoint in linear
history. Autosave and local operations do not imply one revision per keystroke: the presentation
layer batches automatic checkpoints, and users can create manual checkpoints.

Restoring history creates a new revision; it never rewrites existing history. `parentRevisionId`
preserves lineage so change proposals can be introduced later without exposing branch, merge or
rebase concepts in the current product.

Governance is optional and must reference immutable `baseRevisionId` and `candidateRevisionId`.
Ordinary editing and version recovery must not depend on review, approvals or publication policy.
