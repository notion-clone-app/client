import type { FC, PropsWithChildren } from "react";

export const LandingContainer: FC<PropsWithChildren> = ({ children }) => {
  return <div className="mx-auto w-full max-w-[1410px] px-[10px]">{children}</div>;
};
