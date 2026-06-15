import type { FC } from "react"
import { LandingLayout } from "./ui/layout/landing.layout"
import { ArchitectureHero } from "./ui/sections/architecture-hero"

const ArchitecturePage: FC = () => {
    return (
        <LandingLayout>
            <ArchitectureHero />
            {/* <ArchitectureDiagram /> */}
            {/* <TechnologyLayers /> */}
        </LandingLayout>
    )
}

export const Component = ArchitecturePage