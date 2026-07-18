import { Navigate, useNavigate, useParams } from "react-router";
import { Layers3, Plus } from "lucide-react";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "../workspace.context";
import { DocumentTree } from "./ui/document-tree";

const SpacePage = () => {
  const { spaceId } = useParams<"spaceId">();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const space = workspace.spaces.find((candidate) => candidate.id === spaceId);

  if (!space) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const documents = workspace.documents.filter(
    (document) => document.state === "published" && document.spaceId === space.id,
  );
  const drafts = workspace.documents.filter(
    (document) => document.state === "draft" && document.spaceId === space.id,
  );

  const createDraft = () => {
    const document = workspace.createDocument(space.id);
    if (document) void navigate(workspaceDocumentPath(document.id));
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:px-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-4 grid size-10 place-items-center rounded-xl border border-border bg-card shadow-card">
            <Layers3 className="size-4.5" />
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{space.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Draft and publish knowledge inside your own folder structure.
          </p>
        </div>
        <Button onClick={createDraft}>
          <Plus /> New draft
        </Button>
      </div>

      {drafts.length > 0 && (
        <section aria-labelledby="space-drafts" className="mt-12">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="space-drafts" className="text-sm font-medium">
              Drafts
            </h2>
            <span className="text-xs text-muted-foreground">{drafts.length}</span>
          </div>
          <DocumentTree
            documents={drafts}
            selectedDocumentId={null}
            onSelect={(document) => void navigate(workspaceDocumentPath(document.id))}
          />
        </section>
      )}

      <section aria-labelledby="space-content" className={drafts.length ? "mt-12" : "mt-14"}>
        <div className="mb-3 flex items-center gap-3">
          <h2 id="space-content" className="text-sm font-medium">
            Content
          </h2>
          <span className="text-xs text-muted-foreground">{documents.length}</span>
        </div>
        {documents.length ? (
          <DocumentTree
            documents={documents}
            selectedDocumentId={null}
            onSelect={(document) => void navigate(workspaceDocumentPath(document.id))}
          />
        ) : (
          <div className="border-t border-border px-2 py-12 text-sm text-muted-foreground">
            This space does not have published documents yet.
          </div>
        )}
      </section>
    </main>
  );
};

export const Component = SpacePage;
