import { useCallback, useEffect, useState } from "react";
import {
  demoWorkspaceSubspaces,
  type WorkspaceSubspace,
} from "../../documents/model/workspace-document.entity";

const storageKey = "workspace:spaces";

/** Maintains the local-first list of workspace spaces used by the prototype. */
export function useLocalWorkspaceSpaces() {
  const [spaces, setSpaces] = useState<readonly WorkspaceSubspace[]>(readSpaces);

  useEffect(() => {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(spaces));
  }, [spaces]);

  const createSpace = useCallback((title: string) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return null;

    const space: WorkspaceSubspace = {
      id: `${slugify(normalizedTitle) || "space"}-${crypto.randomUUID().slice(0, 6)}`,
      title: normalizedTitle,
    };
    setSpaces((current) => [...current, space]);
    return space;
  }, []);

  return { spaces, createSpace };
}

function readSpaces(): readonly WorkspaceSubspace[] {
  try {
    const value: unknown = JSON.parse(globalThis.localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(value) && value.every(isWorkspaceSpace)) return value;
  } catch {
    // Invalid local prototype data falls back to the stable demo spaces.
  }
  return demoWorkspaceSubspaces;
}

function isWorkspaceSpace(value: unknown): value is WorkspaceSubspace {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string"
  );
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
