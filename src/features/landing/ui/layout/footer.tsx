import type { FC } from "react"
import { LandingContainer } from "../container"
import { Logo } from "../../logo"

export const LandingFooter: FC = () => {
    return (
        <footer>
            <LandingContainer>
                <div>
                    <Logo />
                </div>
                <div>
                    <div>
                    </div>
                    Created by Sergey Glotov
                </div>
            </LandingContainer>
        </footer>
    )
}