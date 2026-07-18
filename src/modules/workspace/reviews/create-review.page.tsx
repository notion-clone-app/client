import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, GitPullRequest, MapPin, Users } from "lucide-react";
import { ROUTES, workspaceReviewPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { useWorkspaceContext } from "../workspace.context";
import { createDocumentReviewChanges } from "./application/create-document-review-changes";

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspace = useWorkspaceContext();
  const allDocuments = flattenDocuments(workspace.documents);
  const documents = allDocuments.filter(
    (document) => document.type === "document-board" && document.state === "draft",
  );
  const targetBoards: readonly WorkspaceDocument[] = [
    ...workspace.spaces.map((space) => ({
      id: space.id,
      title: space.title,
      type: "folder" as const,
      state: "published" as const,
      spaceId: space.id,
    })),
    ...allDocuments.filter(
      (document) => document.type === "folder" && document.state === "published",
    ),
  ];
  const requestedDocumentId = searchParams.get("documentId");
  const [documentId, setDocumentId] = useState(
    documents.some((document) => document.id === requestedDocumentId)
      ? (requestedDocumentId ?? "")
      : (documents[0]?.id ?? ""),
  );
  const initialDocument = documents.find((document) => document.id === documentId);
  const [boardId, setBoardId] = useState(
    initialDocument?.sourceDocumentId ?? initialDocument?.spaceId ?? targetBoards[0]?.id ?? "",
  );
  const [summary, setSummary] = useState("");
  const [path, setPath] = useState(
    initialDocument?.sourceDocumentId
      ? `Source / ${allDocuments.find((document) => document.id === initialDocument.sourceDocumentId)?.title ?? "Document"}`
      : "Knowledge base / New page",
  );
  const [placement, setPlacement] = useState(
    initialDocument?.sourceDocumentId
      ? "Replace the source document with the approved revision."
      : "Add as the last child page in this section.",
  );
  const [reviewerIds, setReviewerIds] = useState<readonly string[]>(
    workspace.members.filter((member) => member.role === "reviewer").map((member) => member.id),
  );
  const selectedDocument = documents.find((document) => document.id === documentId);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const document = documents.find((candidate) => candidate.id === documentId);
    const source = document?.sourceDocumentId
      ? allDocuments.find((candidate) => candidate.id === document.sourceDocumentId)
      : null;
    const board = source ?? targetBoards.find((candidate) => candidate.id === boardId);
    if (!document || !board || !reviewerIds.length) return;
    const draftContent = workspace.getDocumentContent(document);
    const sourceContent = source ? workspace.getDocumentContent(source) : null;

    const review = workspace.createReview({
      documentId: document.id,
      documentTitle: document.title,
      authorId: workspace.members[0]?.id ?? "current-user",
      summary: summary.trim() || "Ready for workspace review.",
      target: {
        mode: source ? "replace-source" : "place-new",
        boardId: board.id,
        boardTitle: board.title,
        path: path.trim(),
        placement: placement.trim(),
      },
      reviewerIds,
      changes: createDocumentReviewChanges(sourceContent, draftContent),
    });
    void navigate(workspaceReviewPath(review.id));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 md:py-14">
      <Button variant="ghost" size="sm" onClick={() => void navigate(ROUTES.WORKSPACE_REVIEWS)}>
        <ArrowLeft /> Reviews
      </Button>

      <div className="mt-7">
        <div className="mb-4 grid size-10 place-items-center rounded-xl border border-border bg-card shadow-card">
          <GitPullRequest className="size-4.5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Create a review request</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Describe what changes and exactly where the document should be published.
        </p>
      </div>

      <form className="mt-9 space-y-5" onSubmit={submit}>
        {!documents.length && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-4 text-sm leading-6 text-muted-foreground">
            There are no drafts to review. Create a document from the Drafts section in the sidebar
            first.
          </div>
        )}
        <Field label="Document">
          <select
            value={documentId}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            onChange={(event) => {
              const nextId = event.target.value;
              const nextDocument = documents.find((document) => document.id === nextId);
              setDocumentId(nextId);
              setBoardId(
                nextDocument?.sourceDocumentId ??
                  nextDocument?.spaceId ??
                  targetBoards[0]?.id ??
                  "",
              );
              if (nextDocument?.sourceDocumentId) {
                const source = allDocuments.find(
                  (document) => document.id === nextDocument.sourceDocumentId,
                );
                setPath(`Source / ${source?.title ?? "Document"}`);
                setPlacement("Replace the source document with the approved revision.");
              }
            }}
          >
            {!documents.length && <option value="">No drafts available</option>}
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Change summary">
          <textarea
            value={summary}
            rows={4}
            placeholder="What is ready for review, and why?"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20"
            onChange={(event) => setSummary(event.target.value)}
          />
        </Field>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="size-4" /> Publication target
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={selectedDocument?.sourceDocumentId ? "Source document" : "Folder"}>
              <select
                value={boardId}
                disabled={Boolean(
                  documents.find((document) => document.id === documentId)?.sourceDocumentId,
                )}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                onChange={(event) => setBoardId(event.target.value)}
              >
                {selectedDocument?.sourceDocumentId ? (
                  <option value={boardId}>
                    {allDocuments.find((document) => document.id === boardId)?.title ??
                      "Source document"}
                  </option>
                ) : (
                  !targetBoards.length && <option value="">No publication targets available</option>
                )}
                {!selectedDocument?.sourceDocumentId &&
                  targetBoards
                    .filter((document) => document.spaceId === selectedDocument?.spaceId)
                    .map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.title}
                      </option>
                    ))}
              </select>
            </Field>
            <Field label="Path">
              <input
                value={path}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                onChange={(event) => setPath(event.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Placement instructions">
              <input
                value={placement}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                onChange={(event) => setPlacement(event.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" /> Reviewers
          </div>
          <div className="mt-3 space-y-1">
            {workspace.members
              .filter((member) => member.status === "active" && member.role !== "owner")
              .map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={reviewerIds.includes(member.id)}
                    onChange={(event) =>
                      setReviewerIds((current) =>
                        event.target.checked
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id),
                      )
                    }
                  />
                  <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                    {initials(member.name)}
                  </span>
                  <span className="text-sm">{member.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {member.role}
                  </span>
                </label>
              ))}
          </div>
        </section>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void navigate(ROUTES.WORKSPACE_REVIEWS)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!reviewerIds.length || !documents.length || !targetBoards.length}
          >
            Create review request
          </Button>
        </div>
      </form>
    </main>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function flattenDocuments(documents: readonly WorkspaceDocument[]): readonly WorkspaceDocument[] {
  return documents.flatMap((document) => [
    document,
    ...(document.children ? flattenDocuments(document.children) : []),
  ]);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Component = CreateReviewPage;
