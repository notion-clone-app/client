import { Navigate, useNavigate, useParams } from "react-router";
import { ArrowRight, GitPullRequest, Plus } from "lucide-react";
import { ROUTES, workspaceReviewPath, workspaceSpaceReviewCreatePath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { SpaceTabs } from "../spaces/ui/space-tabs";
import { useWorkspaceContext } from "../workspace.context";
import { ReviewStatus } from "./ui/review-status";

const ReviewsPage = () => {
  const { spaceId } = useParams<"spaceId">();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const space = workspace.spaces.find((candidate) => candidate.id === spaceId);

  if (!space) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const reviews = workspace.reviews.filter((review) => review.spaceId === space.id);
  const draftCount = workspace.documents.filter(
    (document) => document.spaceId === space.id && document.state === "draft",
  ).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:px-12 md:py-14">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="mb-4 grid size-10 place-items-center rounded-xl bg-muted">
            <GitPullRequest className="size-4.5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">{space.title} reviews</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Review changes and publish documents inside this space.
          </p>
        </div>
        <Button onClick={() => void navigate(workspaceSpaceReviewCreatePath(space.id))}>
          <Plus /> New review
        </Button>
      </div>

      <div className="mt-10">
        <SpaceTabs
          spaceId={space.id}
          active="reviews"
          draftCount={draftCount}
          reviewCount={reviews.length}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {reviews.length ? (
          reviews.map((review, index) => {
            const approvals = review.reviewers.filter(
              (reviewer) => reviewer.status === "approved",
            ).length;
            const comments = review.changes.reduce(
              (total, change) => total + change.comments.length,
              0,
            );
            return (
              <button
                key={review.id}
                type="button"
                className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/45 ${index ? "border-t border-border" : ""}`}
                onClick={() => void navigate(workspaceReviewPath(space.id, review.id))}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <GitPullRequest className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{review.documentTitle}</span>
                    <ReviewStatus status={review.status} />
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {review.target.mode === "replace-source" ? "Updates" : "Publishes to"} →{" "}
                    {review.target.boardTitle} · {review.target.path}
                  </span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {approvals}/{review.reviewers.length} approvals · {comments} comments
                </span>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No review requests in this space yet.
          </div>
        )}
      </section>
    </main>
  );
};

export const Component = ReviewsPage;
