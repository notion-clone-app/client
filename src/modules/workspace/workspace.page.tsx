import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CopyPlus, Download, GitPullRequest, Search } from "lucide-react";
import { useSession } from "@/modules/identity";
import { serializeBlocksToMarkdown } from "@/shared/editor";
import {
  ROUTES,
  workspaceDocumentPath,
  workspaceSpacePath,
  workspaceSpaceReviewCreatePath,
  workspaceSpaceReviewsPath,
} from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useLocalWorkspaceCollaboration } from "./collaboration/application/use-local-workspace-collaboration";
import { WorkspaceHeaderContent } from "./common/workspace-header";
import { GlobalDocumentSearch } from "./common/global-document-search";
import { SpaceSidebarContent } from "./common/space-sidebar-content";
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
  const viewer = session.data?.viewer;
  const collaboration = useLocalWorkspaceCollaboration(
    viewer
      ? {
          id: viewer.id,
          name: `${viewer.firstName} ${viewer.lastName}`.trim(),
          email: viewer.email,
        }
      : null,
  );
  const localSpaces = useLocalWorkspaceSpaces(viewer?.id);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const selectedDocument = documentId
    ? findWorkspaceDocument(localDocuments.documents, documentId)
    : null;
  const activeSection = location.pathname.startsWith(ROUTES.WORKSPACE_SETTINGS)
    ? "settings"
    : spaceId
      ? "space"
      : documentId
        ? "document"
        : "home";
  const headerTitle = selectedDocument?.title ?? "Document";
  const activeSpaceId = spaceId ?? selectedDocument?.spaceId ?? null;
  const activeSpace = localSpaces.spaces.find((space) => space.id === activeSpaceId);
  const activeSpaceView = location.pathname.includes("/reviews")
    ? "reviews"
    : new URLSearchParams(location.search).get("tab") === "drafts" ||
        selectedDocument?.state === "draft"
      ? "drafts"
      : "content";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setIsGlobalSearchOpen((open) => !open);
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          activeSpace ? (
            <SpaceSidebarContent
              space={activeSpace}
              documents={localDocuments.documents}
              selectedDocumentId={selectedDocument?.id ?? null}
              activeView={activeSpaceView}
              onBack={() => void navigate(ROUTES.WORKSPACE)}
              onOpenSearch={() => setIsGlobalSearchOpen(true)}
              onOpenView={(view) =>
                void navigate(
                  view === "reviews"
                    ? workspaceSpaceReviewsPath(activeSpace.id)
                    : `${workspaceSpacePath(activeSpace.id)}?tab=${view}`,
                )
              }
              onOpenDocument={(document) => void navigate(workspaceDocumentPath(document.id))}
              onCreateDocument={() => {
                const document = localDocuments.createDocument(activeSpace.id);
                if (document) void navigate(workspaceDocumentPath(document.id));
              }}
            />
          ) : (
            <WorkspaceSidebarContent
              viewer={viewer}
              spaces={localSpaces.spaces}
              onOpenHome={() => void navigate(ROUTES.WORKSPACE)}
              onOpenSearch={() => setIsGlobalSearchOpen(true)}
              onOpenSpace={(id) => void navigate(workspaceSpacePath(id))}
              onOpenSettings={() => void navigate(ROUTES.WORKSPACE_SETTINGS)}
              activeSection={activeSection}
              activeSpaceId={null}
            />
          )
        ) : null
      }
    >
      {selectedDocument && (
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
            title="Search workspace"
            onClick={() => setIsGlobalSearchOpen(true)}
          >
            <Search />
          </Button>
          {selectedDocument.type === "document-board" && (
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
                      `${workspaceSpaceReviewCreatePath(selectedDocument.spaceId ?? "business")}?documentId=${encodeURIComponent(selectedDocument.id)}`,
                    )
                  }
                >
                  <GitPullRequest />
                  <span className="hidden sm:inline">Request review</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                aria-label="Export document"
                onClick={exportDocument}
              >
                <Download />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          )}
        </WorkspaceHeaderContent>
      )}
      <Outlet
        context={{
          documents: localDocuments.documents,
          spaces: localSpaces.spaces,
          isHydrated: localDocuments.isHydrated,
          createSpace: localSpaces.createSpace,
          updateSpaceCover: localSpaces.updateSpaceCover,
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
      <GlobalDocumentSearch
        open={isGlobalSearchOpen}
        documents={localDocuments.documents}
        spaces={localSpaces.spaces}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelect={(document) => {
          setIsGlobalSearchOpen(false);
          void navigate(workspaceDocumentPath(document.id));
        }}
      />
    </WorkspaceLayout>
  );
};

export const Component = WorkspacePage;
