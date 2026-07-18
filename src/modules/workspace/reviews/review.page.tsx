import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  GitMerge,
  MessageSquare,
  Route,
  Send,
  UserRoundCheck,
} from "lucide-react";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "../workspace.context";
import { ReviewStatus } from "./ui/review-status";

const ReviewPage = () => {
  const { reviewId } = useParams<"reviewId">();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const review = workspace.reviews.find((candidate) => candidate.id === reviewId);
  const [comment, setComment] = useState("");

  if (!review) return <Navigate to={ROUTES.WORKSPACE_REVIEWS} replace />;

  const pendingReviewer = review.reviewers.find((reviewer) => reviewer.status === "pending");
  const approvals = review.reviewers.filter((reviewer) => reviewer.status === "approved").length;
  const unresolvedComments = review.comments.filter((item) => !item.resolved).length;
  const canPublish = review.status === "approved" && unresolvedComments === 0;

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = comment.trim();
    if (!body) return;
    workspace.addComment(review.id, workspace.members[0]?.id ?? "current-user", body);
    setComment("");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 md:py-10">
      <Button variant="ghost" size="sm" onClick={() => void navigate(ROUTES.WORKSPACE_REVIEWS)}>
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
          onClick={() => void navigate(workspaceDocumentPath(review.documentId))}
        >
          Open document <ExternalLink />
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="publication-target">
            <div className="mb-3 flex items-center gap-2">
              <Route className="size-4 text-muted-foreground" />
              <h2 id="publication-target" className="text-sm font-medium">
                Publication target
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-medium">{review.target.boardTitle}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{review.target.path}</p>
              <div className="my-4 h-px bg-border" />
              <p className="text-sm leading-6 text-muted-foreground">{review.target.placement}</p>
            </div>
          </section>

          <section aria-labelledby="review-comments">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <h2 id="review-comments" className="text-sm font-medium">
                Comments · {review.comments.length}
              </h2>
            </div>

            <div className="space-y-3">
              {review.comments.length ? (
                review.comments.map((item) => {
                  const author = workspace.members.find((member) => member.id === item.authorId);
                  return (
                    <article key={item.id} className="rounded-2xl border border-border bg-card p-4">
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
                      <p className="mt-3 text-sm leading-6 text-foreground/85">{item.body}</p>
                      {!item.resolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => workspace.resolveComment(review.id, item.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                  No comments yet. This review is ready for a first pass.
                </div>
              )}
            </div>

            <form
              className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2"
              onSubmit={submitComment}
            >
              <textarea
                value={comment}
                rows={2}
                aria-label="Review comment"
                placeholder="Leave a comment about this document…"
                className="min-h-16 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                onChange={(event) => setComment(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send comment"
                disabled={!comment.trim()}
              >
                <Send />
              </Button>
            </form>
          </section>
        </div>

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
              The document appears on the target board only after approvals and resolved comments.
            </p>
            <Button
              className="mt-4 w-full"
              disabled={!canPublish}
              onClick={() => workspace.publishReview(review.id)}
            >
              <GitMerge /> Publish to board
            </Button>
            {unresolvedComments > 0 && (
              <p className="mt-2 text-center text-[11px] text-amber-700">
                Resolve {unresolvedComments} comment before publishing
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Component = ReviewPage;
