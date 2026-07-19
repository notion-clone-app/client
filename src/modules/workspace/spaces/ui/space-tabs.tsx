import { useNavigate } from "react-router";
import { FileText, GitPullRequest, SquarePen } from "lucide-react";
import { workspaceSpacePath, workspaceSpaceReviewsPath } from "@/shared/model";

type SpaceTab = "content" | "drafts" | "reviews";

export function SpaceTabs({
  spaceId,
  active,
  draftCount,
  reviewCount,
}: {
  spaceId: string;
  active: SpaceTab;
  draftCount: number;
  reviewCount: number;
}) {
  const navigate = useNavigate();
  const tabs = [
    { id: "content" as const, label: "Content", count: null, icon: FileText },
    { id: "drafts" as const, label: "Drafts", count: draftCount, icon: SquarePen },
    { id: "reviews" as const, label: "Reviews", count: reviewCount, icon: GitPullRequest },
  ];

  return (
    <nav aria-label="Space sections" className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            className={`relative flex h-11 items-center gap-2 px-3 text-sm ${active === tab.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() =>
              void navigate(
                tab.id === "reviews"
                  ? workspaceSpaceReviewsPath(spaceId)
                  : `${workspaceSpacePath(spaceId)}?tab=${tab.id}`,
              )
            }
          >
            <Icon className="size-4" /> {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="rounded-full bg-muted px-1.5 text-[10px]">{tab.count}</span>
            )}
            {active === tab.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
