import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Files,
  GitCompareArrows,
  GitMerge,
  MessageSquare,
  Route,
  Send,
  UserRoundCheck,
} from "lucide-react";
import { ROUTES, workspaceDocumentPath, workspaceSpaceReviewsPath } from "@/shared/model";
import { ReadonlyBlocks, type DocumentBlock } from "@/shared/editor";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "../workspace.context";
import type { DocumentReview } from "./model/document-review.entity";
import { ReviewStatus } from "./ui/review-status";

const ReviewPage = () => {
  const { reviewId, spaceId } = useParams<"reviewId" | "spaceId">();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const review = workspace.reviews.find(
    (candidate) => candidate.id === reviewId && candidate.spaceId === spaceId,
  );
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "changes">("overview");
  const [expandedChanges, setExpandedChanges] = useState<Record<string, boolean>>({});
  const [showFullDraft, setShowFullDraft] = useState(false);

  if (!review || !spaceId) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const pendingReviewer = review.reviewers.find((reviewer) => reviewer.status === "pending");
  const approvals = review.reviewers.filter((reviewer) => reviewer.status === "approved").length;
  const comments = review.changes.flatMap((change) => change.comments);
  const unresolvedComments = comments.filter((item) => !item.resolved).length;
  const canPublish = review.status === "approved" && unresolvedComments === 0;
  const openedDocumentId =
    review.status === "published" && review.target.mode === "replace-source"
      ? review.target.boardId
      : review.documentId;

  const submitComment = (event: FormEvent<HTMLFormElement>, changeId: string) => {
    event.preventDefault();
    const body = commentDrafts[changeId]?.trim();
    if (!body) return;
    workspace.addComment(review.id, changeId, workspace.members[0]?.id ?? "current-user", body);
    setCommentDrafts((current) => ({ ...current, [changeId]: "" }));
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 md:py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigate(workspaceSpaceReviewsPath(spaceId))}
      >
        <ArrowLeft /> Review requests
      </Button>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ReviewStatus status={review.status} />
            <span className="text-xs text-muted-foreground">Review #{review.id.slice(0, 8)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            {review.documentTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{review.summary}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void navigate(workspaceDocumentPath(openedDocumentId))}
        >
          {review.status === "published" && review.target.mode === "replace-source"
            ? "Open published revision"
            : "Open draft"}{" "}
          <ExternalLink />
        </Button>
      </div>

      <nav aria-label="Review sections" className="mt-5 flex gap-1 border-b border-border">
        <ReviewTab
          active={activeTab === "overview"}
          icon={Files}
          label="Overview"
          onClick={() => setActiveTab("overview")}
        />
        <ReviewTab
          active={activeTab === "changes"}
          icon={GitCompareArrows}
          label={`Changes ${review.changes.length}`}
          onClick={() => setActiveTab("changes")}
        />
      </nav>

      <div
        className={
          activeTab === "overview" ? "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]" : "mt-6"
        }
      >
        <div className="min-w-0 space-y-8">
          {activeTab === "overview" && (
            <section aria-labelledby="publication-target">
              <div className="mb-3 flex items-center gap-2">
                <Route className="size-4 text-muted-foreground" />
                <h2 id="publication-target" className="text-sm font-medium">
                  Publication target
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-medium">
                  {review.target.mode === "replace-source" ? "Update" : "Publish to"} ·{" "}
                  {review.target.boardTitle}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{review.target.path}</p>
                <div className="my-4 h-px bg-border" />
                <p className="text-sm leading-6 text-muted-foreground">{review.target.placement}</p>
              </div>
            </section>
          )}

          {activeTab === "changes" && (
            <section aria-labelledby="review-changes">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <h2 id="review-changes" className="text-sm font-medium">
                    Changes · {review.changes.length}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={showFullDraft}
                  onClick={() => setShowFullDraft((current) => !current)}
                >
                  <FileText /> {showFullDraft ? "Hide draft" : "View full draft"}
                </Button>
              </div>

              {showFullDraft && <DocumentSnapshot review={review} />}

              <div className="space-y-4">
                {review.changes.map((change) => {
                  const draft = commentDrafts[change.id] ?? "";
                  const expanded = expandedChanges[change.id] ?? false;
                  const context = findChangeContext(review, change.blockId, expanded);
                  const versions = findChangeVersions(review, change.blockId);
                  const hasBefore = Boolean(versions.before ?? change.before);
                  const hasAfter = Boolean(versions.after ?? change.after);
                  return (
                    <article
                      key={change.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${change.kind === "added" ? "bg-emerald-500/10 text-emerald-700" : change.kind === "removed" ? "bg-red-500/10 text-red-700" : "bg-blue-500/10 text-blue-700"}`}
                        >
                          {change.kind}
                        </span>
                        <h3 className="text-sm font-medium">{change.label}</h3>
                        {change.blockId && (
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                            #{change.blockId}
                          </span>
                        )}
                      </div>

                      <div>
                        {context.before.map((block) => (
                          <ContextLine key={block.id} block={block} />
                        ))}
                        <div
                          className={`grid border-b border-border ${hasBefore && hasAfter ? "lg:grid-cols-2" : ""}`}
                        >
                          {hasBefore && (
                            <ChangeVersion
                              label="Before"
                              tone="removed"
                              block={versions.before}
                              fallback={change.before}
                            />
                          )}
                          {hasAfter && (
                            <ChangeVersion
                              label="After"
                              tone="added"
                              block={versions.after}
                              fallback={change.after}
                            />
                          )}
                        </div>
                        {context.after.map((block) => (
                          <ContextLine key={block.id} block={block} />
                        ))}
                      </div>

                      <div className="space-y-3 p-4">
                        {context.canExpand && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-expanded={expanded}
                            onClick={() =>
                              setExpandedChanges((current) => ({
                                ...current,
                                [change.id]: !expanded,
                              }))
                            }
                          >
                            {expanded ? <ChevronUp /> : <ChevronDown />}
                            {expanded ? "Show less context" : "Show more context"}
                          </Button>
                        )}
                        {change.comments.map((item) => {
                          const author = workspace.members.find(
                            (member) => member.id === item.authorId,
                          );
                          return (
                            <div key={item.id} className="rounded-xl bg-muted/45 p-3">
                              <div className="flex items-center gap-2">
                                <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                                  {initials(author?.name ?? "User")}
                                </span>
                                <span className="text-xs font-medium">
                                  {author?.name ?? "Workspace member"}
                                </span>
                                {item.resolved && (
                                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-700">
                                    <Check className="size-3" /> Resolved
                                  </span>
                                )}
                              </div>
                              <p className="mt-3 text-sm leading-6 text-foreground/85">
                                {item.body}
                              </p>
                              {!item.resolved && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() =>
                                    workspace.resolveComment(review.id, change.id, item.id)
                                  }
                                >
                                  Resolve
                                </Button>
                              )}
                            </div>
                          );
                        })}

                        <form
                          className="flex items-end gap-2 rounded-xl border border-border bg-background p-2"
                          onSubmit={(event) => submitComment(event, change.id)}
                        >
                          <textarea
                            value={draft}
                            rows={1}
                            aria-label={`Comment on ${change.label}`}
                            placeholder="Comment on this change…"
                            className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [change.id]: event.target.value,
                              }))
                            }
                          />
                          <Button
                            type="submit"
                            size="icon"
                            aria-label="Send comment"
                            disabled={!draft.trim()}
                          >
                            <Send />
                          </Button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {activeTab === "overview" && (
          <aside className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserRoundCheck className="size-4" /> Approvals
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {approvals} of {workspace.approvalSettings.requiredApprovals} required
              </p>
              <div className="mt-4 space-y-2">
                {review.reviewers.map((reviewer) => {
                  const member = workspace.members.find(
                    (candidate) => candidate.id === reviewer.memberId,
                  );
                  return (
                    <div key={reviewer.memberId} className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                        {initials(member?.name ?? "User")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {member?.name ?? "Reviewer"}
                      </span>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {reviewer.status.replace("-", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
              {pendingReviewer && review.status !== "published" && (
                <Button
                  className="mt-4 w-full"
                  variant="secondary"
                  onClick={() => workspace.approveReview(review.id, pendingReviewer.memberId)}
                >
                  <Check /> Approve as{" "}
                  {workspace.members.find((item) => item.id === pendingReviewer.memberId)?.name}
                </Button>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GitMerge className="size-4" /> Publish
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {review.target.mode === "replace-source"
                  ? "The approved draft becomes the next revision of its source document."
                  : "The document appears in the target folder only after approvals and resolved comments."}
              </p>
              <Button
                className="mt-4 w-full"
                disabled={!canPublish}
                onClick={() => workspace.publishReview(review.id)}
              >
                <GitMerge />{" "}
                {review.target.mode === "replace-source" ? "Publish revision" : "Publish document"}
              </Button>
              {unresolvedComments > 0 && (
                <p className="mt-2 text-center text-[11px] text-amber-700">
                  Resolve {unresolvedComments} comment before publishing
                </p>
              )}
            </section>
          </aside>
        )}
      </div>
    </main>
  );
};

function ReviewTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Files;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`relative flex h-10 items-center gap-2 px-3 text-sm transition-colors ${active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
    >
      <Icon className="size-4" /> {label}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
      )}
    </button>
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

type SnapshotBlock = DocumentBlock;

function findChangeContext(
  review: DocumentReview,
  blockId: string | null,
  expanded: boolean,
): Readonly<{
  before: readonly SnapshotBlock[];
  after: readonly SnapshotBlock[];
  canExpand: boolean;
}> {
  if (!blockId) return { before: [], after: [], canExpand: false };

  const snapshots = [review.snapshots.after, review.snapshots.before].filter(
    (snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot),
  );
  const snapshot = snapshots.find((candidate) =>
    candidate.blocks.some((block) => block.id === blockId),
  );
  if (!snapshot) return { before: [], after: [], canExpand: false };

  const index = snapshot.blocks.findIndex((block) => block.id === blockId);
  const radius = expanded ? 4 : 1;
  return {
    before: snapshot.blocks.slice(Math.max(0, index - radius), index),
    after: snapshot.blocks.slice(index + 1, index + 1 + radius),
    canExpand: index > 1 || snapshot.blocks.length - index - 1 > 1,
  };
}

function ContextLine({ block }: { block: SnapshotBlock }) {
  return (
    <div className="border-b border-border bg-muted/15 px-6 py-4 text-foreground/55">
      <ReadonlyBlocks blocks={[block]} />
    </div>
  );
}

function findChangeVersions(review: DocumentReview, blockId: string | null) {
  if (!blockId) return { before: null, after: null };
  return {
    before: review.snapshots.before?.blocks.find((block) => block.id === blockId) ?? null,
    after: review.snapshots.after.blocks.find((block) => block.id === blockId) ?? null,
  };
}

function ChangeVersion({
  label,
  tone,
  block,
  fallback,
}: Readonly<{
  label: string;
  tone: "added" | "removed";
  block: DocumentBlock | null;
  fallback?: string | undefined;
}>) {
  return (
    <section
      aria-label={label}
      className={`min-h-32 px-6 py-5 ${tone === "added" ? "bg-emerald-500/5" : "border-b border-border bg-red-500/5 lg:border-r lg:border-b-0"}`}
    >
      <div
        className={`mb-5 text-[10px] font-semibold tracking-[0.12em] uppercase ${tone === "added" ? "text-emerald-700" : "text-red-700"}`}
      >
        {label}
      </div>
      {block ? (
        <ReadonlyBlocks blocks={[block]} />
      ) : (
        <p className="text-2xl font-semibold tracking-[-0.025em] whitespace-pre-wrap">{fallback}</p>
      )}
    </section>
  );
}

function DocumentSnapshot({ review }: { review: DocumentReview }) {
  const changedBlockIds = new Set(
    review.changes.flatMap((change) => (change.blockId ? [change.blockId] : [])),
  );
  const titleChanged = review.changes.some((change) => change.blockId === null);

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Draft snapshot</span>
        <span className="ml-auto text-[11px] text-muted-foreground">Read-only revision</span>
      </div>
      <div className="max-h-[58vh] overflow-y-auto px-5 py-6 sm:px-8">
        <h3
          className={`text-2xl font-semibold tracking-[-0.025em] ${titleChanged ? "-mx-2 rounded-lg bg-emerald-500/8 px-2 py-1" : ""}`}
        >
          {review.snapshots.after.title}
        </h3>
        <div className="mt-6 space-y-1">
          {review.snapshots.after.blocks.map((block) => {
            const changed = changedBlockIds.has(block.id);
            return (
              <div
                key={block.id}
                className={`rounded-lg px-3 py-2.5 ${changed ? "bg-emerald-500/8 ring-1 ring-emerald-500/15" : ""}`}
              >
                {changed && (
                  <div className="mb-2 text-[10px] font-medium tracking-wide text-emerald-700 uppercase">
                    Changed
                  </div>
                )}
                <ReadonlyBlocks blocks={[block]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const Component = ReviewPage;
