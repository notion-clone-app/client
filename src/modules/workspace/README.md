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
- workspace spaces, covers, participants and draft/published navigation state;
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
│   └── workspace-documents  Navigation tree lookup
├── reviews/                 Space-scoped review aggregate and request UI
├── spaces/                  Space model, tabs, cover and local-first creation
├── settings/                Workspace, member and approval settings UI
├── dashboard.page.tsx
├── document.page.tsx
└── workspace.page.tsx       Route boundary and dependency composition
```

Dependencies point inward: UI and infrastructure depend on application/model contracts. The model
may depend on the portable `DocumentBlock` type, but shared editor code must never import workspace
code.

## Spaces and drafts

The navigation model is space-first:

```text
Workspace
├── Tech
│   ├── Drafts
│   └── folder/document tree
└── Business
    ├── Drafts
    └── folder/document tree
```

The root workspace sidebar contains home, global search, spaces and settings. Entering a space
switches to a contextual sidebar with Content, Drafts, Reviews, search and that space's pages. Every
new document starts with `state: "draft"` and the owning `spaceId`, so unfinished content remains
visible only inside its space.

Spaces are shown both in the sidebar and on workspace home. User-created spaces are persisted in
local storage by `useLocalWorkspaceSpaces`; document aggregates remain in the IndexedDB document
repository. A fresh browser starts empty: the client does not inject example spaces, documents or
reviews. A one-time migration removes identifiers belonging to the old prototype seeds.

`WorkspaceSpace` is the aggregate root for the prototype navigation surface. It owns cover metadata
and member references; documents and reviews carry `spaceId`. The Space page exposes `Content`,
`Drafts` and `Reviews` as separate views, and review routes include the space ID explicitly. This
prevents drafts, reviewers and publication targets from leaking across spaces.

A draft may also have `sourceDocumentId`. Such a draft is a working copy of an existing published
document. Its review targets the source, and publication writes the approved content back as the
next source revision. A draft without a source is published as a new document at its space root or
under a selected folder.

In the prototype, published documents act as placement targets. The backend model should introduce
an explicit collection or board identity instead of overloading a document node with that role.

## Document representations

The context deliberately keeps two representations:

- `WorkspaceDocumentContent` is the persisted aggregate with blocks, cover, audit metadata,
  publication state and parent placement.
- `WorkspaceDocument` is a lightweight navigation projection derived from those aggregates.

This prevents the space tree from loading full document content and leaves room for independent
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

## Search and page chrome

The workspace shell has no global content header. `WorkspaceHeaderContent` is rendered only for a
document route, where export, draft creation and review actions belong. Home, settings, spaces and
reviews own their page-level headings.

Space search filters a single navigation tree while preserving folders whose descendants match.
Global search flattens lightweight navigation nodes across spaces and opens as a command palette via
the sidebar or `Cmd/Ctrl + K`. Search currently operates on local titles; backend search should add
permissions-aware indexing and return lightweight navigation results, never full editor snapshots.

## Document release lifecycle

Publishing is modeled separately from editing:

```text
published revision → draft copy → review → next published revision
new draft → review → new published space entry
```

`DocumentReview` references a document by ID and records the requested destination, placement
instructions, reviewers, owning `spaceId` and changes. Every discussion belongs to a specific
`DocumentReviewChange` instead of the whole document. A review also pins lightweight immutable
`before` and `after` block snapshots, so its context cannot drift when the editable document changes.
Snapshots reuse the portable `DocumentBlock` schema and are rendered through the readonly registry,
but remain immutable review revisions rather than mutable document aggregates.
The API version should anchor a change to an immutable revision, stable block ID and optional text
range so later edits cannot silently move a comment's meaning.

The review page separates `Overview` from `Changes`. Overview owns governance and publication;
Changes owns the block-level before/after diff and inline discussions. Each delta includes its
nearest blocks by default, can reveal more local context, and can open the full read-only draft
snapshot. This follows GitLab's review flow while keeping the visual language compact and
consistent with the rest of the workspace.

On a draft document, workspace maps review comments by stable `blockId` and renders them beside the
corresponding editor block. The portable editor only exposes a neutral `renderBlockAside` extension
point; it has no dependency on reviews, members or workspace business rules.

The local-first collaboration service persists members, review revisions, discussions and approval
state in local storage. State transitions update React immediately and are persisted afterwards. It
enforces these rules:

- a review must receive the configured number of approvals;
- unresolved comments can block publication;
- a published document has an explicit target board, path and placement instruction;
- publishing moves the document node into the selected board in the local navigation tree;
- workspace invitations start in the `invited` state.

When API integration arrives, review requests and membership should receive a repository port and
an operation queue instead of being added to `WorkspaceDocumentRepository`. Spaces and
collaboration currently use local storage, while document content and publication placement use
IndexedDB. Folder creation, moving and ordering remain navigation concerns for the next iteration.

## Adding a document type

1. Extend `WorkspaceDocumentType` in the workspace model.
2. Add its icon and label to `document-presentation.strategy.ts`.
3. Add its route composition to `document.page.tsx`.
4. Create type-specific model, application and infrastructure code inside this context.

Do not add workspace-specific options to the shared editor model unless they describe portable
content semantics that another host application could use unchanged.
