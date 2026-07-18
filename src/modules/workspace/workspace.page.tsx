import { Outlet, useNavigate, useParams } from "react-router";
import { Search } from "lucide-react";
import { useSession } from "@/modules/identity";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { WorkspaceHeaderContent } from "./common/workspace-header";
import { WorkspaceLayout } from "./common/workspace-layout";
import { WorkspaceSidebarContent } from "./common/workspace-sidebar-content";
import type { WorkspaceDocument } from "./documents/workspace-document.entity";
import { useLocalWorkspaceDocuments } from "./documents/use-local-workspace-documents";
import { findWorkspaceDocument } from "./documents/workspace-documents";

const WorkspacePage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { documentId } = useParams<"documentId">();
  const localDocuments = useLocalWorkspaceDocuments(session.data?.viewer.id);
  const selectedDocument = documentId
    ? findWorkspaceDocument(localDocuments.documents, documentId)
    : null;
  const viewer = session.data?.viewer;

  const openDocument = (document: WorkspaceDocument) => {
    void navigate(workspaceDocumentPath(document.id));
  };

  const createDocument = () => {
    const document = localDocuments.createDocument();
    if (document) void navigate(workspaceDocumentPath(document.id));
  };

  return (
    <WorkspaceLayout
      asideNode={
        viewer ? (
          <WorkspaceSidebarContent
            viewer={viewer}
            documents={localDocuments.documents}
            selectedDocumentId={documentId ?? null}
            onSelectDocument={openDocument}
            onCreateDocument={createDocument}
            onOpenHome={() => void navigate(ROUTES.WORKSPACE)}
          />
        ) : null
      }
    >
      <WorkspaceHeaderContent>
        <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground md:hidden">
          N
        </span>
        <span className="ml-2 text-sm font-medium md:ml-0">
          {selectedDocument?.title ?? (documentId ? "Document" : "Home")}
        </span>
        <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Search">
          <Search />
        </Button>
      </WorkspaceHeaderContent>
      <Outlet
        context={{
          documents: localDocuments.documents,
          isHydrated: localDocuments.isHydrated,
          getEditorDocument: localDocuments.getEditorDocument,
          updateDocument: localDocuments.updateDocument,
        }}
      />
    </WorkspaceLayout>
  );
};

export const Component = WorkspacePage;
