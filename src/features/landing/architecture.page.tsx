import type { FC } from "react"
import { LandingLayout } from "./ui/layout/landing.layout"
import { LandingContainer } from "./ui"
import { ArchitectureHero } from "./ui/sections/architecture-hero"
import { ArchitectureDiagram } from "./ui/sections/architecture-diagram"
import { TechnologyLayers } from "./ui/sections/technology-layers"

const ArchitecturePage: FC = () => {
    return (
        <LandingLayout>
            <LandingContainer>
                <ArchitectureHero />
                <ArchitectureDiagram />
                <TechnologyLayers />
            </LandingContainer>
        </LandingLayout>
    )
}

export const Component = ArchitecturePage