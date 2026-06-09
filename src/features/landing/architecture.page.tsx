import type { FC } from "react"
import { LandingLayout } from "./ui/layout/landing.layout"
import { LandingContainer } from "./ui"

const ArchitecturePage: FC = () => {
    return (
        <LandingLayout>
            <LandingContainer>
                <div>
                    Architecture
                </div>
            </LandingContainer>
        </LandingLayout>
    )
}

export const Component = ArchitecturePage