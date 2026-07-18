import type { ComponentType } from "react";
import { ArrowUpRight, FilePlus2, Lightbulb, PenTool, Upload, Users } from "lucide-react";
import { useSession } from "@/modules/identity";

type SuggestedAction = Readonly<{
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}>;

const suggestedActions: readonly SuggestedAction[] = [
  {
    title: "Create a document board",
    description: "Start a connected knowledge base for notes and ideas.",
    icon: FilePlus2,
  },
  {
    title: "Create a draw board",
    description: "Open an infinite canvas for diagrams and sketches.",
    icon: PenTool,
  },
  {
    title: "Import content",
    description: "Bring existing notes and documents into your workspace.",
    icon: Upload,
  },
  {
    title: "Invite your team",
    description: "Collaborate on shared documents and projects.",
    icon: Users,
  },
];

const DashboardPage = () => {
  const session = useSession();
  const viewer = session.data?.viewer;

  if (!viewer) return null;

  return <DashboardHome firstName={viewer.firstName} />;
};

function DashboardHome({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-5 py-12 sm:px-8 md:py-20">
      <div className="max-w-2xl">
        <div className="mb-5 grid size-11 place-items-center rounded-2xl border border-border bg-card shadow-card">
          <Lightbulb className="size-5 text-amber-500" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          What will you create, {firstName}?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Pick a starting point or open a document from your workspace.
        </p>
      </div>

      <section aria-labelledby="suggested-actions" className="mt-10">
        <h2 id="suggested-actions" className="mb-3 text-xs font-medium text-muted-foreground">
          Suggested actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestedActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                key={action.title}
                className="group flex min-h-32 items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-[0_1px_2px_rgb(28_28_26/0.025)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-card"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-foreground transition-colors group-hover:bg-surface-hover">
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {action.title}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                  </span>
                  <span className="mt-1.5 block text-sm leading-5 text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground/70">
        Tip: press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">⌘ K</kbd> to
        find anything in your workspace.
      </p>
    </div>
  );
}

export const Component = DashboardPage;
