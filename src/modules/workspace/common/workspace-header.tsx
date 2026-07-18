import type { PropsWithChildren } from "react";

export const WorkspaceHeaderContent = ({ children }: PropsWithChildren) => {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-background/85 px-4 backdrop-blur-xl md:px-6">
      {children}
    </header>
  );
};
