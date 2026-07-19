import { ArrowLeft, History, RotateCcw, Save } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useDocumentVersioning, type DocumentRevision } from "@/modules/document-versioning";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "../workspace.context";
import { toDocumentRevisionSnapshot } from "./application/to-document-revision-snapshot";
import { findWorkspaceDocument } from "./workspace-documents";

const DocumentHistoryPage = () => {
  const { documentId } = useParams<"documentId">();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const versioning = useDocumentVersioning();
  const documentNode = documentId ? findWorkspaceDocument(workspace.documents, documentId) : null;

  if (!workspace.isHydrated || !versioning.isHydrated) {
    return <div className="px-8 py-12 text-sm text-muted-foreground">Loading history…</div>;
  }
  if (documentNode?.type !== "document-board") {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }

  const document = workspace.getDocumentContent(documentNode);
  const revisions = versioning.getDocumentRevisions(document.id);

  const saveVersion = () => {
    versioning.createCheckpoint(document.id, toDocumentRevisionSnapshot(document), "manual");
  };

  const restoreVersion = (revision: DocumentRevision) => {
    const restoredDocument = {
      ...document,
      title: revision.snapshot.title,
      coverImage: revision.snapshot.coverImage,
      blocks: revision.snapshot.blocks,
      metadata: {
        ...document.metadata,
        revision: document.metadata.revision + 1,
        updatedAt: new Date().toISOString(),
      },
    };
    workspace.updateDocument(restoredDocument);
    versioning.createCheckpoint(
      document.id,
      toDocumentRevisionSnapshot(restoredDocument),
      "restore",
    );
    void navigate(workspaceDocumentPath(document.id));
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 -ml-3"
            onClick={() => void navigate(workspaceDocumentPath(document.id))}
          >
            <ArrowLeft /> Back to document
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <History className="size-4" /> Version history
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            {document.title.trim() || "Untitled"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The working copy is saved continuously. Checkpoints provide immutable recovery points.
          </p>
        </div>
        <Button onClick={saveVersion}>
          <Save /> Save version
        </Button>
      </div>

      <section aria-label="Document revisions" className="mt-6">
        {revisions.length ? (
          <div className="divide-y divide-border border-y border-border">
            {revisions.map((revision, index) => (
              <article key={revision.id} className="flex items-center gap-4 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <History className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {revision.snapshot.title.trim() || "Untitled"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {revisionLabel(revision)} · {formatRevisionDate(revision.createdAt)}
                  </p>
                </div>
                {index === 0 && (
                  <span className="hidden text-xs text-emerald-700 sm:inline">
                    Latest checkpoint
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={() => restoreVersion(revision)}>
                  <RotateCcw /> Restore
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-border py-16 text-center">
            <History className="mx-auto size-5 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No checkpoints yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Continue editing or save the first named version.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

function revisionLabel(revision: DocumentRevision) {
  if (revision.reason === "restore") return "Restored version";
  if (revision.reason === "manual") return "Manual checkpoint";
  return "Automatic checkpoint";
}

function formatRevisionDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const Component = DocumentHistoryPage;
