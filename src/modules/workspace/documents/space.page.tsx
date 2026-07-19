import { useRef, type ChangeEvent } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { FilePlus2, Layers3, Search, Upload, X } from "lucide-react";
import { ROUTES, workspaceDocumentPath } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { useWorkspaceContext } from "../workspace.context";
import { filterWorkspaceDocumentTree } from "./model/workspace-document-tree";
import { DocumentTree } from "./ui/document-tree";

const SpacePage = () => {
  const { spaceId } = useParams<"spaceId">();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const workspace = useWorkspaceContext();
  const space = workspace.spaces.find((candidate) => candidate.id === spaceId);

  if (!space) return <Navigate to={ROUTES.WORKSPACE} replace />;

  const query = searchParams.get("q") ?? "";
  const documents = workspace.documents.filter(
    (document) => document.state === "published" && document.spaceId === space.id,
  );
  const visibleDocuments = filterWorkspaceDocumentTree(documents, query);
  const members = workspace.members.filter((member) => space.memberIds.includes(member.id));

  const createDocument = () => {
    const document = workspace.createDocument(space.id);
    if (document) void navigate(workspaceDocumentPath(document.id));
  };

  const uploadCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") workspace.updateSpaceCover(space.id, reader.result);
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <article>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload space cover"
        onChange={uploadCover}
      />

      {space.coverImage && (
        <div className="group/cover relative h-48 w-full overflow-hidden bg-muted sm:h-60">
          <img src={space.coverImage} alt="" className="size-full object-cover" />
          <div className="absolute right-6 bottom-4 flex gap-1 opacity-0 transition-opacity group-hover/cover:opacity-100 focus-within:opacity-100">
            <Button variant="secondary" size="sm" onClick={() => coverInputRef.current?.click()}>
              <Upload /> Change cover
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Remove space cover"
              onClick={() => workspace.updateSpaceCover(space.id, undefined)}
            >
              <X />
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:px-12 md:py-14">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-4 grid size-10 place-items-center rounded-xl bg-muted">
              <Layers3 className="size-4.5" />
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{space.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2" aria-label="Space members">
                {members.map((member) => (
                  <span
                    key={member.id}
                    title={member.name}
                    className="grid size-8 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold"
                  >
                    {initials(member.name)}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!space.coverImage && (
              <Button variant="ghost" size="sm" onClick={() => coverInputRef.current?.click()}>
                <Upload /> Add cover
              </Button>
            )}
            <Button onClick={createDocument}>
              <FilePlus2 /> New page
            </Button>
          </div>
        </div>

        <div className="mt-10 flex h-10 max-w-xl items-center gap-2 rounded-xl bg-muted/55 px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            aria-label={`Search content in ${space.title}`}
            placeholder="Search content"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) next.set("q", event.target.value);
              else next.delete("q");
              setSearchParams(next, { replace: true });
            }}
          />
        </div>

        <section aria-labelledby="space-tree" className="mt-7">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="space-tree" className="text-sm font-medium">
              Documents
            </h2>
            <span className="text-xs text-muted-foreground">{visibleDocuments.length}</span>
          </div>
          {visibleDocuments.length ? (
            <DocumentTree
              documents={visibleDocuments}
              selectedDocumentId={null}
              onSelect={(document) => void navigate(workspaceDocumentPath(document.id))}
            />
          ) : (
            <div className="border-t border-border px-2 py-12 text-sm text-muted-foreground">
              {query ? "No documents match this search." : "No documents in this space yet."}
            </div>
          )}
        </section>
      </main>
    </article>
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

export const Component = SpacePage;
