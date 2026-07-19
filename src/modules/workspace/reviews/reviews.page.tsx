import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  GitPullRequest,
  Plus,
} from "lucide-react";
import { ROUTES, workspaceReviewPath, workspaceSpaceReviewCreatePath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { useWorkspaceContext } from "../workspace.context";
import {
  filterDocumentReviews,
  paginateDocumentReviews,
  type ReviewDateFilter,
  type ReviewStatusFilter,
} from "./application/filter-document-reviews";
import { ReviewStatus } from "./ui/review-status";

const pageSize = 5;
const statusOptions: readonly { value: ReviewStatusFilter; label: string }[] = [
  { value: "all", label: "All active statuses" },
  { value: "in-review", label: "In review" },
  { value: "changes-requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
];
const dateOptions: readonly { value: ReviewDateFilter; label: string }[] = [
  { value: "all", label: "Any date" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const ReviewsPage = () => {
  const { spaceId } = useParams<"spaceId">();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspace = useWorkspaceContext();
  const space = workspace.spaces.find((candidate) => candidate.id === spaceId);

  if (!space) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const status = parseStatusFilter(searchParams.get("status"));
  const date = parseDateFilter(searchParams.get("date"));
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const filteredReviews = filterDocumentReviews(workspace.reviews, {
    spaceId: space.id,
    status,
    date,
  });
  const pagination = paginateDocumentReviews(filteredReviews, requestedPage, pageSize);

  const updateFilter = (key: "status" | "date", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:px-12 md:py-14">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="mb-4 grid size-10 place-items-center rounded-xl bg-muted">
            <GitPullRequest className="size-4.5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">{space.title} reviews</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Active review requests. Published reviews leave this working queue automatically.
          </p>
        </div>
        <Button onClick={() => void navigate(workspaceSpaceReviewCreatePath(space.id))}>
          <Plus /> New review
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <FilterMenu
          icon={Filter}
          label={statusOptions.find((option) => option.value === status)?.label ?? "Status"}
          value={status}
          options={statusOptions}
          onChange={(value) => updateFilter("status", value)}
        />
        <FilterMenu
          icon={CalendarDays}
          label={dateOptions.find((option) => option.value === date)?.label ?? "Date"}
          value={date}
          options={dateOptions}
          onChange={(value) => updateFilter("date", value)}
        />
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {pagination.items.length ? (
          pagination.items.map((review, index) => {
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
                    {formatReviewDate(review.createdAt)} ·{" "}
                    {review.target.mode === "replace-source" ? "Updates" : "Publishes to"} →{" "}
                    {review.target.boardTitle}
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
          <div className="px-5 py-14 text-center">
            <GitPullRequest className="mx-auto size-5 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No active reviews match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Published requests are kept out of the active review queue.
            </p>
          </div>
        )}
      </section>

      {pagination.pageCount > 1 && (
        <nav aria-label="Review pages" className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.pageCount}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              <ChevronLeft /> Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === pagination.pageCount}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next <ChevronRight />
            </Button>
          </div>
        </nav>
      )}
    </main>
  );
};

function FilterMenu<TValue extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: typeof Filter;
  label: string;
  value: TValue;
  options: readonly { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon /> {label} <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onChange(option.value)}>
            <span className="flex-1">{option.label}</span>
            {option.value === value && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function parseStatusFilter(value: string | null): ReviewStatusFilter {
  return statusOptions.some((option) => option.value === value)
    ? (value as ReviewStatusFilter)
    : "all";
}

function parseDateFilter(value: string | null): ReviewDateFilter {
  return dateOptions.some((option) => option.value === value) ? (value as ReviewDateFilter) : "all";
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export const Component = ReviewsPage;
