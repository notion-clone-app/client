import { Navigate, useParams } from "react-router";
import { ROUTES } from "@/shared/model";
import type { WorkspaceDocumentContent } from "./documents/model/workspace-document-content.entity";
import { getDocumentPresentation } from "./documents/ui/document-presentation.strategy";
import { WorkspaceDocumentEditor } from "./documents/ui/workspace-document-editor";
import { findWorkspaceDocument } from "./documents/workspace-documents";
import { useWorkspaceContext } from "./workspace.context";

const DocumentPage = () => {
  const { documentId } = useParams<"documentId">();
  const workspace = useWorkspaceContext();
  const document = documentId ? findWorkspaceDocument(workspace.documents, documentId) : null;

  if (!workspace.isHydrated) {
    return <div className="px-8 py-12 text-sm text-muted-foreground">Loading local document…</div>;
  }

  if (!document) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const presentation = getDocumentPresentation(document.type);
  const Icon = presentation.icon;

  if (document.type === "document-board") {
    const commentsByBlockId = createBlockComments(document.id, workspace);
    return (
      <DocumentBoardEditor
        key={document.id}
        document={workspace.getDocumentContent(document)}
        onChange={workspace.updateDocument}
        commentsByBlockId={commentsByBlockId}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 md:py-20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`size-4 ${presentation.iconClassName}`} />
        {presentation.label}
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{document.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        The {presentation.label.toLowerCase()} editor will be implemented later.
      </p>
    </div>
  );
};

function DocumentBoardEditor({
  document,
  onChange,
  commentsByBlockId,
}: {
  document: WorkspaceDocumentContent;
  onChange: (document: WorkspaceDocumentContent) => void;
  commentsByBlockId: ReadonlyMap<
    string,
    readonly { id: string; authorName: string; body: string; resolved: boolean }[]
  >;
}) {
  return (
    <WorkspaceDocumentEditor
      document={document}
      onChange={onChange}
      commentsByBlockId={commentsByBlockId}
    />
  );
}

function createBlockComments(
  documentId: string,
  workspace: ReturnType<typeof useWorkspaceContext>,
) {
  const comments = new Map<
    string,
    readonly { id: string; authorName: string; body: string; resolved: boolean }[]
  >();
  const review = workspace.reviews.find(
    (candidate) => candidate.documentId === documentId && candidate.status !== "published",
  );
  if (!review) return comments;

  for (const change of review.changes) {
    if (!change.blockId || !change.comments.length) continue;
    comments.set(
      change.blockId,
      change.comments.map((comment) => ({
        id: comment.id,
        authorName:
          workspace.members.find((member) => member.id === comment.authorId)?.name ??
          "Workspace member",
        body: comment.body,
        resolved: comment.resolved,
      })),
    );
  }
  return comments;
}

export const Component = DocumentPage;
