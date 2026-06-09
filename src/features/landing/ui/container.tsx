import type { FC, PropsWithChildren } from "react"

export const LandingContainer: FC<PropsWithChildren> = ({ children }) => {
    return <div className="max-w-[1410px] w-full mx-auto px-[10px]">{children}</div>
}