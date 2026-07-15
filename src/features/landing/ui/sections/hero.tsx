import { useTranslation } from "@/shared/model/localization";
import { Button } from "@/shared/ui/kit/button";
import { useRef, type FC } from "react";
import { LandingContainer } from "../container";
import { CursorTrail } from "../cursor-trail";
import { Logo } from "../../logo";
import { TypographyH1, TypographyLead } from "@/shared/ui/typography";
import { motion, useScroll, useTransform } from "motion/react";

const VIDEO_URL = "https://www.pexels.com/download/video/33352808/";

export const HeroSection: FC = () => {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
    >
      <motion.video
        className="pointer-events-none absolute top-0 left-0 size-full object-cover"
        src={VIDEO_URL}
        loop
        autoPlay
        muted
        playsInline
      />
      <div className="pointer-events-none absolute inset-0" />
      <CursorTrail />

      <LandingContainer>
        <motion.div
          className="relative z-10 flex w-full flex-col items-center"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="flex max-w-4xl flex-col items-center gap-10 text-center">
            <motion.div
              className="flex items-center justify-start gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Logo />
              <span className="text-sm font-medium text-black">
                {t("landing:hero.badge", { defaultValue: "Notion clone" })}
              </span>
            </motion.div>

            <motion.div className="flex flex-col items-center gap-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <TypographyH1 className="leading-[1.1] text-black select-none">
                  {t("landing:hero.title")}
                </TypographyH1>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
              >
                <TypographyLead className="mx-auto max-w-2xl text-black select-none">
                  {t("landing:hero.subtitle")}
                </TypographyLead>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-4"
              >
                <Button
                  size="lg"
                  className="font-mediumi h-12 border-none bg-black px-8 text-base text-white shadow-lg"
                >
                  {t("landing:hero.buttons.cta")}
                </Button>
                <Button
                  size="lg"
                  className="h-12 border-none bg-white/10 px-8 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  {t("landing:hero.buttons.github")}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </LandingContainer>
    </section>
  );
};
