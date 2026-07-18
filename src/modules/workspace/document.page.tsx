import { useState } from "react";
import { Navigate, useParams } from "react-router";
import { Eye, Pencil } from "lucide-react";
import { DocumentEditor, ReadonlyDocument, type EditorDocument } from "@/shared/editor";
import { ROUTES } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { getDocumentPresentation } from "./documents/document-presentation.strategy";
import { useWorkspaceDocumentContext } from "./documents/workspace-document.context";
import { findWorkspaceDocument } from "./documents/workspace-documents";

const DocumentPage = () => {
  const { documentId } = useParams<"documentId">();
  const workspace = useWorkspaceDocumentContext();
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
        document={workspace.getEditorDocument(document)}
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
  document: EditorDocument;
  onChange: (document: EditorDocument) => void;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 md:py-12">
      <div className="mb-10 flex items-center justify-end gap-1">
        <Button
          variant={mode === "edit" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Pencil />
          Edit
        </Button>
        <Button
          variant={mode === "preview" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          <Eye />
          Preview
        </Button>
      </div>

      {mode === "edit" ? (
        <DocumentEditor document={document} onChange={onChange} />
      ) : (
        <ReadonlyDocument document={document} showMetadata />
      )}
    </div>
  );
}

export const Component = DocumentPage;
