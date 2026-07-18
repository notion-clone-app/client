import type { FC, PropsWithChildren, ReactNode } from "react";

interface WorkspaceLayoutProps {
  asideNode: ReactNode | null;
}

export const WorkspaceLayout: FC<PropsWithChildren<WorkspaceLayoutProps>> = ({
  asideNode,
  children,
}) => {
  return (
    <div className="flex min-h-dvh bg-background">
      {asideNode && (
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-gray-100 bg-white md:flex">
          {asideNode}
        </aside>
      )}
      <main className="min-h-dvh min-w-0 flex-1 md:ml-72">{children}</main>
    </div>
  );
};
