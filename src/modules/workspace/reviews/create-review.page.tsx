import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  GitPullRequest,
  MapPin,
  Settings2,
  Users,
} from "lucide-react";
import {
  ROUTES,
  workspaceDocumentPath,
  workspaceReviewPath,
  workspaceSpaceReviewsPath,
} from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { flattenWorkspaceDocuments } from "../documents/model/workspace-document-tree";
import { useWorkspaceContext } from "../workspace.context";
import {
  createDocumentReviewChanges,
  createDocumentReviewSnapshots,
} from "./application/create-document-review-changes";

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const { spaceId } = useParams<"spaceId">();
  const [searchParams] = useSearchParams();
  const workspace = useWorkspaceContext();
  const space = workspace.spaces.find((candidate) => candidate.id === spaceId);
  const allDocuments = flattenWorkspaceDocuments(workspace.documents);
  const drafts = allDocuments.filter(
    (document) =>
      document.type === "document-board" &&
      document.state === "draft" &&
      document.spaceId === spaceId,
  );
  const publicationTargets: readonly WorkspaceDocument[] = [
    ...(space
      ? [
          {
            id: space.id,
            title: space.title,
            type: "folder" as const,
            state: "published" as const,
            spaceId: space.id,
          },
        ]
      : []),
    ...allDocuments.filter(
      (document) =>
        document.type === "folder" &&
        document.state === "published" &&
        document.spaceId === spaceId,
    ),
  ];
  const requestedDocumentId = searchParams.get("documentId");
  const initialDocument =
    drafts.find((document) => document.id === requestedDocumentId) ?? drafts[0];
  const initialSource = initialDocument?.sourceDocumentId
    ? allDocuments.find((document) => document.id === initialDocument.sourceDocumentId)
    : null;
  const authorId = workspace.members[0]?.id ?? "current-user";
  const reviewerCandidates = workspace.members.filter((member) => member.id !== authorId);
  const [documentId, setDocumentId] = useState(initialDocument?.id ?? "");
  const [targetId, setTargetId] = useState(
    initialSource?.id ?? initialDocument?.spaceId ?? publicationTargets[0]?.id ?? "",
  );
  const [summary, setSummary] = useState("");
  const [path, setPath] = useState(
    initialSource ? `Source / ${initialSource.title}` : `${space?.title ?? "Space"} / New page`,
  );
  const [placement, setPlacement] = useState(
    initialSource
      ? "Replace the source document with the approved revision."
      : "Publish at the selected location.",
  );
  const [reviewerIds, setReviewerIds] = useState<readonly string[]>(
    reviewerCandidates.filter((member) => member.role === "reviewer").map((member) => member.id),
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const selectedDocument = drafts.find((document) => document.id === documentId);
  const sourceDocument = selectedDocument?.sourceDocumentId
    ? allDocuments.find((document) => document.id === selectedDocument.sourceDocumentId)
    : null;
  const selectedTarget =
    sourceDocument ?? publicationTargets.find((document) => document.id === targetId);

  if (!space) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const selectDocument = (document: WorkspaceDocument) => {
    const source = document.sourceDocumentId
      ? allDocuments.find((candidate) => candidate.id === document.sourceDocumentId)
      : null;
    setDocumentId(document.id);
    setTargetId(source?.id ?? document.spaceId ?? publicationTargets[0]?.id ?? "");
    setPath(source ? `Source / ${source.title}` : `${space.title} / New page`);
    setPlacement(
      source
        ? "Replace the source document with the approved revision."
        : "Publish at the selected location.",
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDocument || !selectedTarget || !reviewerIds.length) return;
    const draftContent = workspace.getDocumentContent(selectedDocument);
    const sourceContent = sourceDocument ? workspace.getDocumentContent(sourceDocument) : null;
    const review = workspace.createReview({
      spaceId: space.id,
      documentId: selectedDocument.id,
      documentTitle: selectedDocument.title,
      authorId,
      summary: summary.trim() || "Ready for workspace review.",
      target: {
        mode: sourceDocument ? "replace-source" : "place-new",
        boardId: selectedTarget.id,
        boardTitle: selectedTarget.title,
        path: path.trim() || `${space.title} / ${selectedDocument.title}`,
        placement: placement.trim() || "Publish at the selected location.",
      },
      reviewerIds,
      changes: createDocumentReviewChanges(sourceContent, draftContent),
      snapshots: createDocumentReviewSnapshots(sourceContent, draftContent),
    });
    void navigate(workspaceReviewPath(space.id, review.id));
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 md:py-14">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigate(workspaceSpaceReviewsPath(space.id))}
      >
        <ArrowLeft /> Reviews
      </Button>

      <div className="mt-7 max-w-2xl">
        <div className="mb-4 grid size-10 place-items-center rounded-xl bg-muted">
          <GitPullRequest className="size-4.5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Request document review</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose the draft and reviewers. Publication details are inferred and can be adjusted only
          when needed.
        </p>
      </div>

      {!drafts.length ? (
        <EmptyDrafts
          onCreate={() => {
            const document = workspace.createDocument(space.id);
            if (document) void navigate(workspaceDocumentPath(document.id));
          }}
        />
      ) : (
        <form className="mt-9 space-y-7" onSubmit={submit}>
          <section>
            <SectionHeading
              icon={FileText}
              title="Draft"
              description="The revision that reviewers will see."
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-[0_1px_2px_rgb(20_20_18/0.03)] transition-colors hover:bg-muted/30"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-muted">
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {documentTitle(selectedDocument)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {sourceDocument ? `Revision of ${sourceDocument.title}` : "New document"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                {drafts.map((document) => (
                  <DropdownMenuItem key={document.id} onSelect={() => selectDocument(document)}>
                    <FileText />
                    <span className="min-w-0 flex-1 truncate">{documentTitle(document)}</span>
                    {document.id === documentId && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          <section>
            <SectionHeading
              icon={MapPin}
              title="Publication"
              description="Where the approved revision will appear."
            />
            <div className="mt-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-muted">
                  <FolderOpen className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">
                    {sourceDocument ? "Updates source" : "Publishes to"}
                  </span>
                  <span className="block truncate text-sm font-medium">
                    {selectedTarget?.title ?? space.title}
                  </span>
                </span>
                {!sourceDocument && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        Change <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {publicationTargets.map((target) => (
                        <DropdownMenuItem key={target.id} onSelect={() => setTargetId(target.id)}>
                          <FolderOpen />{" "}
                          <span className="min-w-0 flex-1 truncate">{target.title}</span>
                          {target.id === targetId && <Check className="ml-auto" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setShowAdvanced((open) => !open)}
              >
                <Settings2 /> {showAdvanced ? "Hide advanced details" : "Advanced details"}
              </Button>
              {showAdvanced && (
                <div className="mt-3 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  <Field label="Path">
                    <input
                      value={path}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      onChange={(event) => setPath(event.target.value)}
                    />
                  </Field>
                  <Field label="Placement">
                    <input
                      value={placement}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      onChange={(event) => setPlacement(event.target.value)}
                    />
                  </Field>
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={Users}
              title="Reviewers"
              description="Select the people responsible for approval."
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {reviewerCandidates.map((member) => {
                const selected = reviewerIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${selected ? "border-foreground/25 bg-muted/55" : "border-border bg-card hover:bg-muted/30"}`}
                    onClick={() =>
                      setReviewerIds((current) =>
                        selected
                          ? current.filter((id) => id !== member.id)
                          : [...current, member.id],
                      )
                    }
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                      {initials(member.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{member.name}</span>
                      <span className="block text-xs text-muted-foreground capitalize">
                        {member.role} · {member.status}
                      </span>
                    </span>
                    <span
                      className={`grid size-5 place-items-center rounded-md border ${selected ? "border-foreground bg-foreground text-background" : "border-border"}`}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                );
              })}
              {!reviewerCandidates.length && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground sm:col-span-2">
                  Invite another workspace member before requesting review.
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={GitPullRequest}
              title="Summary"
              description="Give reviewers the context they need."
            />
            <textarea
              value={summary}
              rows={4}
              placeholder="What changed, and what should reviewers focus on?"
              className="mt-3 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20"
              onChange={(event) => setSummary(event.target.value)}
            />
          </section>

          <div className="sticky bottom-4 flex justify-end gap-2 rounded-2xl border border-border/80 bg-background/90 p-2 shadow-[0_12px_38px_rgb(20_20_18/0.12)] backdrop-blur-xl">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void navigate(workspaceSpaceReviewsPath(space.id))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDocument || !selectedTarget || !reviewerIds.length}
            >
              Create review
            </Button>
          </div>
        </form>
      )}
    </main>
  );
};

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function EmptyDrafts({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mt-9 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-muted">
        <GitPullRequest className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-medium">No legacy review drafts</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        New documents now use continuous editing and immutable version history. This screen remains
        available only for review drafts created by the earlier prototype.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        Create regular document
      </Button>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function documentTitle(document: WorkspaceDocument | undefined) {
  return document?.title.trim() ? document.title : "Untitled";
}

export const Component = CreateReviewPage;
