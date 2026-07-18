export type WorkspaceMemberRole = "owner" | "editor" | "reviewer" | "viewer";
type WorkspaceMemberStatus = "active" | "invited";

/** Workspace participant who can author, review or read documents. */
export type WorkspaceMember = Readonly<{
  id: string;
  name: string;
  email: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  avatarTone: "amber" | "blue" | "green" | "violet";
}>;

export type WorkspaceApprovalSettings = Readonly<{
  requiredApprovals: number;
  authorCanApprove: boolean;
  requireResolvedComments: boolean;
}>;
