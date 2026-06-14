import { cn } from "@/shared/lib/css"
import { LandingContainer } from "../container"
import { Logo } from "../../logo"
import { Button } from "@/shared/ui/kit/button"
import { ExternalLink } from "lucide-react"
import { Link } from "react-router"
import { PickLanguageDropdown } from "../../pick-language-dropdown"
import { ToggleTheme } from "../toggle-theme"
import { ROUTES } from "@/shared/model"
import type { FC, ReactNode } from "react"
import { useTranslation } from '@/shared/model/localization'
import { useWindowScroll } from "../../use-window-scroll.hook"

const NavLink: FC<{ children: ReactNode, isScrolled: boolean }> = ({ children, isScrolled }) => (
    <Button 
        variant="link" 
        className={cn(
            "text-sm font-medium transition-colors h-auto p-0",
            isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
        )} 
        asChild
    >
        {children}
    </Button>
)

export const LandingHeader: FC = () => {
    const { t } = useTranslation()
    const { currentScrollOffsetY } = useWindowScroll()
    const isScrolled = currentScrollOffsetY > 20

    return (
        <header
            className={cn(
                "fixed top-0 left-0 w-full z-20 h-16 flex items-center transition-all duration-300",
                isScrolled 
                    ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm text-foreground" 
                    : "bg-transparent border-transparent text-white"
            )}
        >
            <LandingContainer>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to={ROUTES.HOME} className="flex items-center">
                            <Logo />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink isScrolled={isScrolled}>
                                <span>{t('landing:header.menu.about')}</span>
                            </NavLink>
                            <NavLink isScrolled={isScrolled}>
                                <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                    <span>Head hunter</span>
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </NavLink>
                            <NavLink isScrolled={isScrolled}>
                                <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                    <span>LinkedIn</span>
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </NavLink>
                            <NavLink isScrolled={isScrolled}>
                                <Link to={ROUTES.ARCHITECTURE}>{t('landing:header.menu.architecture')}</Link>
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "text-sm font-medium h-9",
                                    !isScrolled && "text-white hover:text-white hover:bg-white/10"
                                )} 
                                asChild
                            >
                                <Link to={ROUTES.LOGIN}>{t('landing:header.actions.login')}</Link>
                            </Button>
                            <Button 
                                className={cn(
                                    "h-9 text-sm font-medium px-4",
                                    !isScrolled && "bg-white text-black hover:bg-white/90"
                                )} 
                                asChild
                            >
                                <Link to={ROUTES.LOGIN}>{t('landing:header.actions.registration')}</Link>
                            </Button>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 border-l pl-4",
                            isScrolled ? "border-border" : "border-white/20"
                        )}>
                            <PickLanguageDropdown />
                            <ToggleTheme />
                        </div>
                    </div>
                </div>
            </LandingContainer>
        </header>
    )
}