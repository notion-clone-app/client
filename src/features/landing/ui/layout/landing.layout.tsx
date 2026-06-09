import type { FC, PropsWithChildren } from "react";
import { LandingHeader } from "./header";
import { LandingFooter } from "./footer";

export const LandingLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen h-full">
            <LandingHeader />
            <main className="flex-1">{children}</main>
            <LandingFooter />
        </div>
    )
}