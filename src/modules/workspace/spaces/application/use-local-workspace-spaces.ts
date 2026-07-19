import { useCallback, useEffect, useState } from "react";
import type { WorkspaceSpace } from "../model/workspace-space.entity";

const storageKey = "workspace:spaces:v2";
const legacyStorageKey = "workspace:spaces";
const legacySeedSpaceIds = new Set(["tech", "business"]);

/** Maintains the local-first list of workspace spaces used by the prototype. */
export function useLocalWorkspaceSpaces(currentMemberId: string | undefined) {
  const [spaces, setSpaces] = useState<readonly WorkspaceSpace[]>(readSpaces);

  useEffect(() => {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(spaces));
  }, [spaces]);

  const createSpace = useCallback(
    (title: string) => {
      const normalizedTitle = title.trim();
      if (!normalizedTitle) return null;

      const space: WorkspaceSpace = {
        id: `${slugify(normalizedTitle) || "space"}-${crypto.randomUUID().slice(0, 6)}`,
        title: normalizedTitle,
        memberIds: currentMemberId ? [currentMemberId] : [],
      };
      setSpaces((current) => [...current, space]);
      return space;
    },
    [currentMemberId],
  );

  const updateSpaceCover = useCallback((spaceId: string, coverImage: string | undefined) => {
    setSpaces((current) =>
      current.map((space) => (space.id === spaceId ? { ...space, coverImage } : space)),
    );
  }, []);

  return { spaces, createSpace, updateSpaceCover };
}

function readSpaces(): readonly WorkspaceSpace[] {
  const current = readSpacesFromStorage(storageKey);
  if (current) return current;

  return (readSpacesFromStorage(legacyStorageKey) ?? []).filter(
    (space) => !legacySeedSpaceIds.has(space.id),
  );
}

function readSpacesFromStorage(key: string): readonly WorkspaceSpace[] | null {
  try {
    const value: unknown = JSON.parse(globalThis.localStorage.getItem(key) ?? "null");
    if (Array.isArray(value)) {
      const spaces = value.map(normalizeWorkspaceSpace).filter((space) => space !== null);
      if (spaces.length === value.length) return spaces;
    }
  } catch {
    // Invalid local data is ignored.
  }
  return null;
}

function normalizeWorkspaceSpace(value: unknown): WorkspaceSpace | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("title" in value) ||
    typeof value.title !== "string"
  ) {
    return null;
  }

  const memberIds =
    "memberIds" in value && Array.isArray(value.memberIds)
      ? value.memberIds.filter((memberId): memberId is string => typeof memberId === "string")
      : [];
  const coverImage =
    "coverImage" in value && typeof value.coverImage === "string" ? value.coverImage : undefined;
  return { id: value.id, title: value.title, memberIds, coverImage };
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
