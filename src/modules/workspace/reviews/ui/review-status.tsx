import { Check, CircleDot, GitMerge, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/css";
import type { DocumentReviewStatus } from "../model/document-review.entity";

const presentation = {
  "in-review": { label: "In review", icon: CircleDot, className: "text-amber-700 bg-amber-500/10" },
  "changes-requested": {
    label: "Changes requested",
    icon: RotateCcw,
    className: "text-rose-700 bg-rose-500/10",
  },
  approved: { label: "Approved", icon: Check, className: "text-emerald-700 bg-emerald-500/10" },
  published: { label: "Published", icon: GitMerge, className: "text-blue-700 bg-blue-500/10" },
} satisfies Record<DocumentReviewStatus, { label: string; icon: typeof Check; className: string }>;

export function ReviewStatus({ status }: { status: DocumentReviewStatus }) {
  const item = presentation[status];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium",
        item.className,
      )}
    >
      <Icon className="size-3" />
      {item.label}
    </span>
  );
}
