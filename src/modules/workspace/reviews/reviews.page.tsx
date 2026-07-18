import { useNavigate } from "react-router";
import { ArrowRight, GitPullRequest, Plus } from "lucide-react";
import { ROUTES, workspaceReviewPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { ReviewStatus } from "./ui/review-status";
import { useWorkspaceContext } from "../workspace.context";

const ReviewsPage = () => {
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 md:py-14">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="mb-4 grid size-10 place-items-center rounded-xl border border-border bg-card shadow-card">
            <GitPullRequest className="size-4.5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Document reviews</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Review changes, discuss placement and approve documents before they reach a board.
          </p>
        </div>
        <Button onClick={() => void navigate(ROUTES.WORKSPACE_REVIEW_CREATE)}>
          <Plus /> New review
        </Button>
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        {workspace.reviews.map((review, index) => {
          const approvals = review.reviewers.filter(
            (reviewer) => reviewer.status === "approved",
          ).length;
          return (
            <button
              key={review.id}
              type="button"
              className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/45 ${index ? "border-t border-border" : ""}`}
              onClick={() => void navigate(workspaceReviewPath(review.id))}
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
                  → {review.target.boardTitle} · {review.target.path}
                </span>
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {approvals}/{review.reviewers.length} approvals · {review.comments.length} comments
              </span>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </section>
    </main>
  );
};

export const Component = ReviewsPage;
