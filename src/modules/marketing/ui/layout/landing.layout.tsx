import type { FC, PropsWithChildren } from "react";
import { LandingHeader } from "./header";
import { LandingFooter } from "./footer";

export const LandingLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
};
