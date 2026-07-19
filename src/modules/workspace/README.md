# Workspace context

`workspace` composes authenticated workspace surfaces: navigation, spaces, members and document
presentation. Immutable history is owned by the separate `document-versioning` context. Review is
legacy prototype governance and is no longer part of the primary document flow.

The module currently supports document boards and draw boards. Only document boards have an
editable content surface; draw boards remain a routed placeholder.

## Boundary

Workspace owns:

- document and workspace identifiers;
- document title, cover and audit metadata;
- the navigation tree and document type;
- workspace spaces, covers, participants and document navigation state;
- optimistic application state;
- persistence ports and the IndexedDB adapter;
- workspace-specific page composition, routing and export.
- workspace membership, invitations and roles;
- legacy review requests and publication targets while governance is being isolated;

`shared/editor` owns only reusable editor capabilities:

- the serializable block schema;
- Markdown parsing and block serialization;
- the block registry;
- editable and readonly block rendering.

Shared editor code does not know about workspaces, users, revisions, IndexedDB, API routes or sync
state. This is the extraction boundary for a future editor package.

The editable surface keeps at most one empty trailing block. The add-block affordance appears only
when the current tail has content; Enter cannot produce a chain of empty blocks or list items.
Arrow navigation still includes the empty block, and Backspace on an already empty block removes it
while moving focus to its nearest sibling. The last remaining empty editor surface is preserved so
the document never becomes impossible to edit.

## Structure

```text
document-versioning/         Independent revision context (domain → application ← infrastructure)

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

## Spaces and documents

The navigation model is space-first:

```text
Workspace
├── Tech
│   └── folder/document tree
└── Business
    └── folder/document tree
```

The root workspace sidebar contains home, global search, spaces and settings. Entering a space
switches to a contextual sidebar with Content, search and that space's pages. `New page` creates a
working copy immediately; ordinary editing has no draft or approval state.

Spaces are shown both in the sidebar and on workspace home. User-created spaces are persisted in
local storage by `useLocalWorkspaceSpaces`; document aggregates remain in the IndexedDB document
repository. A fresh browser starts empty: the client does not inject example spaces, documents or
reviews. A one-time migration removes identifiers belonging to the old prototype seeds.

`WorkspaceSpace` owns cover metadata and member references; documents carry `spaceId`. Legacy
review routes retain the space ID explicitly but are not linked from the ordinary workspace UI.

Persisted `draft` records from the earlier prototype are migrated into regular visible documents on
hydration. New documents use continuous editing and version checkpoints.

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
document route, where history, search and export actions belong. Home, settings and spaces own their
page-level headings.

Space search filters a single navigation tree while preserving folders whose descendants match.
Global search flattens lightweight navigation nodes across spaces and opens as a command palette via
the sidebar or `Cmd/Ctrl + K`. Search currently operates on local titles; backend search should add
permissions-aware indexing and return lightweight navigation results, never full editor snapshots.

## Document version lifecycle

The mutable document record is a continuously saved working copy. The `document-versioning` module
captures immutable automatic and manual checkpoints in its own IndexedDB adapter. Restoring a
checkpoint updates the working copy and creates another revision instead of rewriting history.

```text
working copy → automatic/manual checkpoint → version history
old checkpoint → restore → new checkpoint
```

`parentRevisionId` keeps the model ready for future change proposals without exposing branch,
merge or rebase behavior today. See `docs/ARCHITECTURE_STYLE_GUIDE.md` for the dependency rules.

## Legacy governance lifecycle

The previous prototype modeled publishing separately from editing:

```text
new page → direct editing in space
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

The space review index is an active work queue: published reviews remain persisted but are omitted
from this list. Status and relative-date filters are encoded in URL search parameters, pagination
uses the same filtered result, and a changed filter resets the queue to its first page.

Review creation is progressive: the user first selects a draft and reviewers, while the publication
target is inferred from the source document or current space. Path and placement controls are kept
behind `Advanced details`. Selection controls use the shared Radix-based dropdown presentation
instead of browser-native selects.

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
