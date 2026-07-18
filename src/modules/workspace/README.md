# Workspace context

`workspace` is the bounded context for authenticated collaboration surfaces. It owns workspace
navigation, document identity, document metadata, local-first orchestration and the presentation of
workspace document types. It also owns membership and the document release lifecycle.

The module currently supports document boards and draw boards. Only document boards have an
editable content surface; draw boards remain a routed placeholder.

## Boundary

Workspace owns:

- document and workspace identifiers;
- document title, cover and audit metadata;
- the navigation tree and document type;
- optimistic application state;
- persistence ports and the IndexedDB adapter;
- workspace-specific page composition, routing and export.
- workspace membership, invitations and roles;
- review requests, comments, approvals and publication targets;

`shared/editor` owns only reusable editor capabilities:

- the serializable block schema;
- Markdown parsing and block serialization;
- the block registry;
- editable and readonly block rendering.

Shared editor code does not know about workspaces, users, revisions, IndexedDB, API routes or sync
state. This is the extraction boundary for a future editor package.

## Structure

```text
workspace/
├── collaboration/           Members, invitations and approval policy
├── common/                  Workspace shell, header and sidebar
├── documents/
│   ├── application/         Optimistic workflows and persistence ports
│   ├── infrastructure/      IndexedDB implementation of persistence ports
│   ├── model/               Workspace-owned document entities and factories
│   ├── ui/                  Workspace document composition and presentation
│   ├── demo-document-board  Temporary content seed
│   └── workspace-documents  Temporary navigation seed and tree lookup
├── reviews/                 Document review aggregate and review request UI
├── settings/                Workspace, member and approval settings UI
├── dashboard.page.tsx
├── document.page.tsx
└── workspace.page.tsx       Route boundary and dependency composition
```

Dependencies point inward: UI and infrastructure depend on application/model contracts. The model
may depend on the portable `DocumentBlock` type, but shared editor code must never import workspace
code.

## Document representations

The context deliberately keeps two representations:

- `WorkspaceDocument` is a lightweight navigation node with `id`, `title`, `type` and children.
- `WorkspaceDocumentContent` is the editable aggregate with blocks, cover and audit metadata.

This prevents the sidebar tree from loading full document content and leaves room for independent
navigation and content endpoints.

## Local-first flow

1. `workspace.page.tsx` composes the authenticated user with
   `useLocalWorkspaceDocuments`.
2. The hook hydrates document snapshots through `WorkspaceDocumentRepository`.
3. Edits replace React state synchronously, so the UI never waits for storage or network latency.
4. The latest snapshot is written to the repository in the background.
5. The IndexedDB adapter falls back to memory when IndexedDB is unavailable.

Persistence errors are currently reported to the console and do not roll back optimistic state.
Production synchronization should add an operation queue and explicit sync status rather than
coupling network calls to the editor.

## Future backend synchronization

The next adapter can combine IndexedDB with API synchronization while preserving the repository
port. Recommended responsibilities are:

- keep snapshots and pending operations in IndexedDB;
- send operations when connectivity is available;
- acknowledge server revisions;
- expose `local`, `syncing`, `synced` and `conflict` states;
- resolve conflicts at block or operation level.

The shared block editor should remain unaware of that lifecycle.

## Document release lifecycle

Publishing is modeled separately from editing:

```text
editable document → review request → approvals and comments → published board entry
```

`DocumentReview` references a document by ID and records the requested destination, placement
instructions, reviewers and discussion. It does not embed editor blocks. This keeps content editing
independent from governance and allows multiple review attempts over future document revisions.

The current collaboration adapter is intentionally in-memory. It demonstrates these rules:

- a review must receive the configured number of approvals;
- unresolved comments can block publication;
- a published document has an explicit target board, path and placement instruction;
- publishing moves the document node into the selected board in the local navigation tree;
- workspace invitations start in the `invited` state.

When API integration arrives, review requests and membership should receive their own repositories
instead of being added to `WorkspaceDocumentRepository`.

Mock membership, reviews and published placements reset after a page reload. Document content still
uses the IndexedDB repository described above.

## Adding a document type

1. Extend `WorkspaceDocumentType` in the workspace model.
2. Add its icon and label to `document-presentation.strategy.ts`.
3. Add its route composition to `document.page.tsx`.
4. Create type-specific model, application and infrastructure code inside this context.

Do not add workspace-specific options to the shared editor model unless they describe portable
content semantics that another host application could use unchanged.
