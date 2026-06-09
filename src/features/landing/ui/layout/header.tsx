import { cn } from "@/shared/lib/css"
import { LandingContainer } from "../container"
import { Logo } from "../../logo"
import { Button } from "@/shared/ui/kit/button"
import { ExternalLink } from "lucide-react"
import { Link } from "react-router"
import { PickLanguageDropdown } from "../../pick-language-dropdown"
import { ToggleTheme } from "../toggle-theme"
import { ROUTES } from "@/shared/model"
import type { FC } from "react"
import { useTranslation } from '@/shared/model/localization'



export const LandingHeader: FC = () => {
    const { t } = useTranslation()
    return (
        <header
            className={cn("sticky top-0 left-0 w-full z-20 h-20 flex items-center transition-all bg-popover")}
        >
            <LandingContainer>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link to={ROUTES.HOME}>
                            <Logo />
                        </Link>
                        <nav>
                            <Button variant="link" asChild>
                                <span>{t('landing:header.menu.about')}</span>
                            </Button>
                            <Button variant="link" asChild>
                                <div>
                                    <span>Head hunter</span>
                                    <ExternalLink />
                                </div>
                            </Button>
                            <Button variant="link" asChild>
                                <div>
                                    <span>LinkedIn</span>
                                    <ExternalLink />
                                </div>
                            </Button>
                            <Button variant="link" asChild>
                                <Link to={ROUTES.ARCHITECTURE}>{t('landing:header.menu.architecture')}</Link>
                            </Button>
                        </nav>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild>
                            <Link to={ROUTES.LOGIN}>{t('landing:header.actions.login')}</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link to={ROUTES.LOGIN}>{t('landing:header.actions.registration')}</Link>
                        </Button>
                        <PickLanguageDropdown />
                        <ToggleTheme />
                    </div>
                </div>
            </LandingContainer>
        </header>
    )
}