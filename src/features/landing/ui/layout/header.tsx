import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model";
import { useTranslation } from "@/shared/model/localization";
import { Button } from "@/shared/ui/kit/button";
import { ExternalLink } from "lucide-react";
import type { FC, ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "../../logo";
import { PickLanguageDropdown } from "../../pick-language-dropdown";
import { useWindowScroll } from "../../use-window-scroll.hook";
import { LandingContainer } from "../container";
import { ToggleTheme } from "../toggle-theme";

const NavLink: FC<{ children: ReactNode }> = ({ children }) => (
  <Button
    variant="link"
    className={cn(
      "h-auto p-0 text-sm font-medium text-[inherit] transition-colors hover:text-[inherit] hover:opacity-70",
    )}
    asChild
  >
    {children}
  </Button>
);

export const LandingHeader: FC = () => {
  const { t } = useTranslation();
  const { currentScrollOffsetY } = useWindowScroll();
  const isScrolled = currentScrollOffsetY > 20;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-20 flex h-16 w-full items-center transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/90 text-foreground shadow-xs backdrop-blur-xl"
          : "border-transparent bg-transparent text-foreground",
      )}
    >
      <LandingContainer>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={ROUTES.HOME} className="flex items-center">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink>
                <span>{t("landing:header.menu.about")}</span>
              </NavLink>
              <NavLink>
                <a
                  href="https://hh.ru"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <span>Head hunter</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </NavLink>
              <NavLink>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </NavLink>
              <NavLink>
                <Link to={ROUTES.ARCHITECTURE}>{t("landing:header.menu.architecture")}</Link>
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="secondary" asChild>
                <Link to={ROUTES.LOGIN}>{t("landing:header.actions.login")}</Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.REGISTRATION}>{t("landing:header.actions.registration")}</Link>
              </Button>
            </div>
            <div className={cn("flex items-center gap-2 border-l pl-4", "border-border")}>
              <PickLanguageDropdown />
              <ToggleTheme />
            </div>
          </div>
        </div>
      </LandingContainer>
    </header>
  );
};
