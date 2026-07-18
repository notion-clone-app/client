import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, GitPullRequest, MapPin, Users } from "lucide-react";
import { ROUTES, workspaceReviewPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { useWorkspaceContext } from "../workspace.context";

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspace = useWorkspaceContext();
  const documents = flattenDocuments(workspace.documents).filter(
    (document) => document.type === "document-board",
  );
  const requestedDocumentId = searchParams.get("documentId");
  const [documentId, setDocumentId] = useState(
    documents.some((document) => document.id === requestedDocumentId)
      ? (requestedDocumentId ?? "")
      : (documents[0]?.id ?? ""),
  );
  const [boardId, setBoardId] = useState(documents[1]?.id ?? documents[0]?.id ?? "");
  const [summary, setSummary] = useState("");
  const [path, setPath] = useState("Knowledge base / New page");
  const [placement, setPlacement] = useState("Add as the last child page in this section.");
  const [reviewerIds, setReviewerIds] = useState<readonly string[]>(
    workspace.members.filter((member) => member.role === "reviewer").map((member) => member.id),
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const document = documents.find((candidate) => candidate.id === documentId);
    const board = documents.find((candidate) => candidate.id === boardId);
    if (!document || !board || !reviewerIds.length) return;

    const review = workspace.createReview({
      documentId: document.id,
      documentTitle: document.title,
      authorId: workspace.members[0]?.id ?? "current-user",
      summary: summary.trim() || "Ready for workspace review.",
      target: {
        boardId: board.id,
        boardTitle: board.title,
        path: path.trim(),
        placement: placement.trim(),
      },
      reviewerIds,
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
        <Field label="Document">
          <select
            value={documentId}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            onChange={(event) => setDocumentId(event.target.value)}
          >
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
            <Field label="Board">
              <select
                value={boardId}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                onChange={(event) => setBoardId(event.target.value)}
              >
                {documents.map((document) => (
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
          <Button type="submit" disabled={!reviewerIds.length}>
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
