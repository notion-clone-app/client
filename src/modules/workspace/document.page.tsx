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
    return (
      <DocumentBoardEditor
        key={document.id}
        document={workspace.getDocumentContent(document)}
        onChange={workspace.updateDocument}
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
}: {
  document: WorkspaceDocumentContent;
  onChange: (document: WorkspaceDocumentContent) => void;
}) {
  return <WorkspaceDocumentEditor document={document} onChange={onChange} />;
}

export const Component = DocumentPage;
