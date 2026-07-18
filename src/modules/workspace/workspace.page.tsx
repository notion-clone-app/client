import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CopyPlus, Download, GitPullRequest, Search } from "lucide-react";
import { useSession } from "@/modules/identity";
import { serializeBlocksToMarkdown } from "@/shared/editor";
import { ROUTES, workspaceDocumentPath, workspaceSpacePath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useMockWorkspaceCollaboration } from "./collaboration/application/use-mock-workspace-collaboration";
import { WorkspaceHeaderContent } from "./common/workspace-header";
import { WorkspaceLayout } from "./common/workspace-layout";
import { WorkspaceSidebarContent } from "./common/workspace-sidebar-content";
import { useLocalWorkspaceDocuments } from "./documents/application/use-local-workspace-documents";
import { indexedDbWorkspaceDocumentRepository } from "./documents/infrastructure/indexeddb-workspace-document.repository";
import { findWorkspaceDocument } from "./documents/workspace-documents";
import { useLocalWorkspaceSpaces } from "./spaces/application/use-local-workspace-spaces";

const WorkspacePage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { documentId, spaceId } = useParams<"documentId" | "spaceId">();
  const localDocuments = useLocalWorkspaceDocuments(
    session.data?.viewer.id,
    indexedDbWorkspaceDocumentRepository,
  );
  const collaboration = useMockWorkspaceCollaboration();
  const localSpaces = useLocalWorkspaceSpaces();
  const selectedDocument = documentId
    ? findWorkspaceDocument(localDocuments.documents, documentId)
    : null;
  const viewer = session.data?.viewer;
  const activeSection = location.pathname.startsWith(ROUTES.WORKSPACE_REVIEWS)
    ? "reviews"
    : location.pathname.startsWith(ROUTES.WORKSPACE_SETTINGS)
      ? "settings"
      : spaceId
        ? "space"
        : documentId
          ? "document"
          : "home";
  const selectedSpace = localSpaces.spaces.find((space) => space.id === spaceId);
  const headerTitle =
    activeSection === "reviews"
      ? "Document reviews"
      : activeSection === "settings"
        ? "Workspace settings"
        : (selectedSpace?.title ?? selectedDocument?.title ?? (documentId ? "Document" : "Home"));

  const createDraftFromSelectedDocument = () => {
    if (!selectedDocument) return;
    const draft = localDocuments.createDraftFromDocument(selectedDocument.id);
    if (draft) void navigate(workspaceDocumentPath(draft.id));
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
    if (review.target.mode === "replace-source") {
      localDocuments.publishDraftToSource(review.documentId);
    } else {
      localDocuments.placeDocument(review.documentId, review.target.boardId);
    }
  };

  return (
    <WorkspaceLayout
      asideNode={
        viewer ? (
          <WorkspaceSidebarContent
            viewer={viewer}
            spaces={localSpaces.spaces}
            onOpenHome={() => void navigate(ROUTES.WORKSPACE)}
            onOpenSpace={(id) => void navigate(workspaceSpacePath(id))}
            onOpenReviews={() => void navigate(ROUTES.WORKSPACE_REVIEWS)}
            onOpenSettings={() => void navigate(ROUTES.WORKSPACE_SETTINGS)}
            activeSection={activeSection}
            activeSpaceId={spaceId ?? selectedDocument?.spaceId ?? null}
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
            {selectedDocument.state === "published" && (
              <Button variant="ghost" size="sm" onClick={createDraftFromSelectedDocument}>
                <CopyPlus />
                <span className="hidden sm:inline">Create draft</span>
              </Button>
            )}
            {selectedDocument.state === "draft" && (
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
            )}
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
          spaces: localSpaces.spaces,
          isHydrated: localDocuments.isHydrated,
          createSpace: localSpaces.createSpace,
          createDocument: localDocuments.createDocument,
          createDraftFromDocument: localDocuments.createDraftFromDocument,
          publishDraftToSource: localDocuments.publishDraftToSource,
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
