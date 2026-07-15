import { motion, useReducedMotion } from "motion/react";
import type { FC } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { useTranslation } from "@/shared/model/localization";
import { InteractiveTrail } from "@/shared/ui/effects/interactive-trail";
import { Button } from "@/shared/ui/kit/button";
import { TypographyH1, TypographyLead } from "@/shared/ui/typography";
import { Logo } from "../../logo";
import { LandingContainer } from "../container";

const VIDEO_URL = "https://www.pexels.com/download/video/33352808/";
const GITHUB_URL = "https://github.com/notion-clone-app/client";
const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

export const HeroSection: FC = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      data-header-surface="media"
      className="relative isolate flex min-h-svh overflow-hidden bg-[#dfe4ff] text-media-foreground md:h-[1200px]"
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_25%,#f7f5ff_0%,#d7e2ff_42%,#aeb8ff_100%)]" />
      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 size-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_52%,rgba(218,225,255,0.2)_100%)]" />

      <InteractiveTrail className="z-10 text-white/80" />

      <LandingContainer>
        <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-4 pt-40 text-center md:pt-44">
          <motion.div
            className="mb-9 flex items-center gap-2 rounded-full bg-media-surface px-4 py-2 backdrop-blur-xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ENTRANCE_EASE }}
          >
            <Logo />
            <span className="text-sm font-medium">
              {t("landing:hero.badge", { defaultValue: "Notion clone" })}
            </span>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: ENTRANCE_EASE }}
          >
            <TypographyH1 className="max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.94] tracking-[-0.065em] text-media-foreground select-none">
              {t("landing:hero.title")}
            </TypographyH1>
          </motion.div>

          <motion.div
            className="mt-7"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: ENTRANCE_EASE }}
          >
            <TypographyLead className="mx-auto max-w-2xl text-base leading-relaxed text-media-muted select-none sm:text-xl">
              {t("landing:hero.subtitle")}
            </TypographyLead>
          </motion.div>

          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: ENTRANCE_EASE }}
          >
            <Button size="lg" variant="on-media" asChild>
              <Link to={ROUTES.REGISTRATION}>{t("landing:hero.buttons.cta")}</Link>
            </Button>
            <Button size="lg" variant="on-media-ghost" asChild>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                {t("landing:hero.buttons.github")}
              </a>
            </Button>
          </motion.div>
        </div>
      </LandingContainer>
    </section>
  );
};
