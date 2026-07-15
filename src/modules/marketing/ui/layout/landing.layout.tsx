import type { FC, PropsWithChildren } from "react";
import { LandingHeader } from "./header";
import { LandingFooter } from "./footer";

type LandingLayoutProps = PropsWithChildren<{
  headerSurface?: "default" | "media";
}>;

export const LandingLayout: FC<LandingLayoutProps> = ({ children, headerSurface = "default" }) => {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <LandingHeader surface={headerSurface} />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
};
