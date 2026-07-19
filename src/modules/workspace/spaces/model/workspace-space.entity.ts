/** Workspace partition that owns navigation, drafts, reviews and membership. */
export type WorkspaceSpace = Readonly<{
  id: string;
  title: string;
  coverImage?: string | undefined;
  memberIds: readonly string[];
}>;
