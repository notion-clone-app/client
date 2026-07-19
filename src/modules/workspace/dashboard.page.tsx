import { useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Layers3, Lightbulb, PenTool, Plus, Upload, Users, X } from "lucide-react";
import { useSession } from "@/modules/identity";
import { workspaceSpacePath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "./workspace.context";

type SuggestedAction = Readonly<{
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}>;

const suggestedActions: readonly SuggestedAction[] = [
  {
    title: "Browse your knowledge",
    description: "Open a space and continue from its document tree.",
    icon: Layers3,
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
  const workspace = useWorkspaceContext();

  if (!viewer) return null;

  return <DashboardHome firstName={viewer.firstName} workspace={workspace} />;
};

function DashboardHome({
  firstName,
  workspace,
}: {
  firstName: string;
  workspace: ReturnType<typeof useWorkspaceContext>;
}) {
  const navigate = useNavigate();
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState("");

  const createSpace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const space = workspace.createSpace(spaceTitle);
    if (!space) return;
    setSpaceTitle("");
    setIsCreatingSpace(false);
    void navigate(workspaceSpacePath(space.id));
  };

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

      <section aria-labelledby="workspace-spaces" className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="workspace-spaces" className="text-base font-medium">
              Spaces
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Knowledge, documents and drafts grouped by purpose.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsCreatingSpace(true)}>
            <Plus /> New space
          </Button>
        </div>

        {isCreatingSpace && (
          <form
            className="mb-3 flex items-center gap-2 rounded-2xl bg-muted/55 p-3"
            onSubmit={createSpace}
          >
            <Layers3 className="ml-1 size-4 text-muted-foreground" />
            <input
              value={spaceTitle}
              aria-label="Space name"
              placeholder="Space name"
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              onChange={(event) => setSpaceTitle(event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cancel"
              onClick={() => setIsCreatingSpace(false)}
            >
              <X />
            </Button>
            <Button type="submit" size="sm" disabled={!spaceTitle.trim()}>
              Create
            </Button>
          </form>
        )}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workspace.spaces.map((space) => {
            const count = workspace.documents.filter(
              (document) => document.spaceId === space.id,
            ).length;
            return (
              <button
                key={space.id}
                type="button"
                className="group flex min-h-28 flex-col rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,background-color] hover:border-foreground/20 hover:bg-muted/30"
                onClick={() => void navigate(workspaceSpacePath(space.id))}
              >
                <span className="flex w-full items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted">
                    <Layers3 className="size-4" />
                  </span>
                  <span className="font-medium">{space.title}</span>
                  <ArrowUpRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-auto text-xs text-muted-foreground">
                  {count} top-level items
                </span>
              </button>
            );
          })}
        </div>
      </section>

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
