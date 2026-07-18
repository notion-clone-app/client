import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { Download, GitPullRequest, Search } from "lucide-react";
import { useSession } from "@/modules/identity";
import { serializeBlocksToMarkdown } from "@/shared/editor";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useMockWorkspaceCollaboration } from "./collaboration/application/use-mock-workspace-collaboration";
import { WorkspaceHeaderContent } from "./common/workspace-header";
import { WorkspaceLayout } from "./common/workspace-layout";
import { WorkspaceSidebarContent } from "./common/workspace-sidebar-content";
import { useLocalWorkspaceDocuments } from "./documents/application/use-local-workspace-documents";
import { indexedDbWorkspaceDocumentRepository } from "./documents/infrastructure/indexeddb-workspace-document.repository";
import type { WorkspaceDocument } from "./documents/model/workspace-document.entity";
import { findWorkspaceDocument } from "./documents/workspace-documents";

const WorkspacePage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { documentId } = useParams<"documentId">();
  const localDocuments = useLocalWorkspaceDocuments(
    session.data?.viewer.id,
    indexedDbWorkspaceDocumentRepository,
  );
  const collaboration = useMockWorkspaceCollaboration();
  const selectedDocument = documentId
    ? findWorkspaceDocument(localDocuments.documents, documentId)
    : null;
  const viewer = session.data?.viewer;
  const activeSection = location.pathname.startsWith(ROUTES.WORKSPACE_REVIEWS)
    ? "reviews"
    : location.pathname.startsWith(ROUTES.WORKSPACE_SETTINGS)
      ? "settings"
      : documentId
        ? "document"
        : "home";
  const headerTitle =
    activeSection === "reviews"
      ? "Document reviews"
      : activeSection === "settings"
        ? "Workspace settings"
        : (selectedDocument?.title ?? (documentId ? "Document" : "Home"));

  const openDocument = (document: WorkspaceDocument) => {
    void navigate(workspaceDocumentPath(document.id));
  };

  const createDocument = () => {
    const document = localDocuments.createDocument();
    if (document) void navigate(workspaceDocumentPath(document.id));
  };

  const exportDocument = () => {
    if (selectedDocument?.type !== "document-board") return;
    const document = localDocuments.getDocumentContent(selectedDocument);
    const content = serializeBlocksToMarkdown(document.blocks);
    const markdown = [`# ${document.title.trim() || "Untitled"}`, content]
      .filter(Boolean)
      .join("\n\n");
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${document.title.trim() || "untitled"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const publishReview = (reviewId: string) => {
    const review = collaboration.reviews.find((candidate) => candidate.id === reviewId);
    if (review?.status !== "approved") return;
    collaboration.publishReview(reviewId);
    localDocuments.placeDocument(review.documentId, review.target.boardId);
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
            onOpenReviews={() => void navigate(ROUTES.WORKSPACE_REVIEWS)}
            onOpenSettings={() => void navigate(ROUTES.WORKSPACE_SETTINGS)}
            activeSection={activeSection}
            reviewCount={
              collaboration.reviews.filter((review) => review.status === "in-review").length
            }
          />
        ) : null
      }
    >
      <WorkspaceHeaderContent>
        <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground md:hidden">
          N
        </span>
        <span className="ml-2 text-sm font-medium md:ml-0">{headerTitle}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          aria-label="Search document"
          title="Document search is coming next"
        >
          <Search />
        </Button>
        {selectedDocument?.type === "document-board" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                void navigate(
                  `${ROUTES.WORKSPACE_REVIEW_CREATE}?documentId=${encodeURIComponent(selectedDocument.id)}`,
                )
              }
            >
              <GitPullRequest />
              <span className="hidden sm:inline">Request review</span>
            </Button>
            <Button variant="ghost" size="sm" aria-label="Export document" onClick={exportDocument}>
              <Download />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </>
        )}
      </WorkspaceHeaderContent>
      <Outlet
        context={{
          documents: localDocuments.documents,
          isHydrated: localDocuments.isHydrated,
          getDocumentContent: localDocuments.getDocumentContent,
          updateDocument: localDocuments.updateDocument,
          ...collaboration,
          placeDocument: localDocuments.placeDocument,
          publishReview,
        }}
      />
    </WorkspaceLayout>
  );
};

export const Component = WorkspacePage;
